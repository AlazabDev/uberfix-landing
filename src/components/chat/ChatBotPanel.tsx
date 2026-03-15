import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Send, Bot, User, Sparkles, Minimize2, Camera, Mic, MicOff,
  Paperclip, Phone, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: "user" | "bot";
  timestamp: Date;
  type?: "text" | "image" | "voice" | "file";
  attachment?: string;
  fileName?: string;
}

interface ChatBotPanelProps {
  onClose: () => void;
}

const WHATSAPP_NUMBER = "201028291995";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBotPanel = ({ onClose }: ChatBotPanelProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.language === 'ar';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: isRTL
        ? "مرحباً! أنا مساعد UberFix الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm UberFix AI Assistant. How can I help you today?",
      role: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>("");

  // Initialize session id
  useEffect(() => {
    const stored = sessionStorage.getItem("uberfix_chat_session");
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const id = crypto.randomUUID();
      sessionStorage.setItem("uberfix_chat_session", id);
      sessionIdRef.current = id;
    }
  }, []);

  const quickActions = isRTL ? [
    "احجز خدمة صيانة",
    "أسعار الخدمات",
    "تتبع طلبي",
  ] : [
    "Book a service",
    "Service pricing",
    "Track my order",
  ];

  // Create or get conversation
  const ensureConversation = useCallback(async () => {
    if (conversationIdRef.current) return conversationIdRef.current;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ session_id: sessionIdRef.current as string, language: i18n.language })
      .select("id")
      .single();
    if (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
    conversationIdRef.current = data.id;
    return data.id;
  }, [i18n.language]);

  // Save message to DB
  const saveMessage = useCallback(async (role: "user" | "bot", content: string, messageType = "text", fileName?: string) => {
    const convId = await ensureConversation();
    if (!convId || !content.trim()) return;
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role,
      content,
      message_type: messageType,
      file_name: fileName || null,
    });
    // Update conversation timestamp
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
  }, [ensureConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const transferToWhatsApp = useCallback(() => {
    const lastMessages = messages
      .filter(m => m.role === "user")
      .slice(-3)
      .map(m => m.content)
      .join("\n");
    const greeting = isRTL ? "مرحباً، أريد المساعدة:" : "Hello, I need help:";
    const text = encodeURIComponent(`${greeting}\n${lastMessages}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }, [messages, isRTL]);

  const streamAIResponse = useCallback(async (userMessage: string, allMessages: Message[]) => {
    setIsTyping(true);

    // Build conversation history for AI (last 10 messages for context)
    const history = allMessages
      .slice(-10)
      .map(m => ({
        role: m.role === "bot" ? "assistant" as const : "user" as const,
        content: m.content,
      }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        content: "",
        role: "bot",
        timestamp: new Date(),
      }]);
      setIsTyping(false);

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const finalContent = assistantContent;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m)
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const finalContent = assistantContent;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m)
              );
            }
          } catch { /* ignore */ }
        }
      }

      // Save bot response to DB
      if (assistantContent.trim()) {
        saveMessage("bot", assistantContent);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setIsTyping(false);
      const errorMsg = isRTL
        ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل عبر واتساب."
        : "Sorry, an error occurred. Please try again or contact us via WhatsApp.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: errorMsg,
        role: "bot",
        timestamp: new Date(),
      }]);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [isRTL, toast, saveMessage]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    saveMessage("user", inputValue, "text");
    streamAIResponse(inputValue, newMessages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        const imgMsg: Message = {
          id: Date.now().toString(),
          content: isRTL ? "📸 صورة مرفقة" : "📸 Image attached",
          role: "user",
          timestamp: new Date(),
          type: "image",
          attachment: reader.result as string,
        };
        const newMessages = [...messages, imgMsg];
        setMessages(newMessages);
        saveMessage("user", imgMsg.content, "image");
        streamAIResponse(isRTL ? "أرسلت لك صورة، كيف يمكنك مساعدتي؟" : "I sent you an image, how can you help?", newMessages);
      };
      reader.readAsDataURL(file);
    } else {
      const fileMsg: Message = {
        id: Date.now().toString(),
        content: isRTL ? `📎 ملف: ${file.name}` : `📎 File: ${file.name}`,
        role: "user",
        timestamp: new Date(),
        type: "file",
        fileName: file.name,
      };
      const newMessages = [...messages, fileMsg];
      setMessages(newMessages);
      saveMessage("user", fileMsg.content, "file", file.name);
      streamAIResponse(isRTL ? `أرسلت ملف بعنوان ${file.name}` : `I sent a file named ${file.name}`, newMessages);
    }
    if (e.target) e.target.value = "";
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingInterval.current) clearInterval(recordingInterval.current);

      const voiceMsg: Message = {
        id: Date.now().toString(),
        content: isRTL
          ? `🎙️ رسالة صوتية (${recordingTime} ثانية)`
          : `🎙️ Voice message (${recordingTime}s)`,
        role: "user",
        timestamp: new Date(),
        type: "voice",
      };
      const newMessages = [...messages, voiceMsg];
      setMessages(newMessages);
      setRecordingTime(0);
      saveMessage("user", voiceMsg.content, "voice");
      streamAIResponse(
        isRTL ? "أرسلت رسالة صوتية، أريد المساعدة في خدمات الصيانة" : "I sent a voice message, I need help with maintenance services",
        newMessages
      );
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[80vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
      style={{ background: 'hsl(var(--background))' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hidden inputs */}
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, "file")} className="hidden" />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, "image")} accept="image/*" className="hidden" />
      <input type="file" ref={cameraInputRef} onChange={(e) => handleFileChange(e, "image")} accept="image/*" capture="environment" className="hidden" />

      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-9 h-9 border-2 border-primary-foreground/30">
              <AvatarImage src="/icons/uberfix-icon.gif" alt="UberFix Bot" />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-primary" />
          </div>
          <div>
            <h3 className="text-primary-foreground font-semibold text-sm">
              {isRTL ? "مساعد UberFix" : "UberFix Assistant"}
            </h3>
            <p className="text-primary-foreground/60 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isRTL ? "مدعوم بالذكاء الاصطناعي" : "AI-Powered"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={transferToWhatsApp}
            className="text-primary-foreground/80 hover:text-emerald-400 hover:bg-primary-foreground/10 h-8 w-8"
            title={isRTL ? "تحويل إلى واتساب" : "Transfer to WhatsApp"}
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* WhatsApp Banner */}
      <button
        onClick={transferToWhatsApp}
        className="flex items-center justify-center gap-2 px-3 py-2 text-primary-foreground text-xs font-medium transition-colors shrink-0"
        style={{ background: 'hsl(152 69% 31%)' }}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {isRTL ? "تحدث مباشرة عبر واتساب الأعمال" : "Chat directly on WhatsApp Business"}
      </button>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-7 h-7 shrink-0 mt-1">
                {message.role === "bot" ? (
                  <>
                    <AvatarImage src="/icons/uberfix-icon.gif" alt="Bot" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <Bot className="w-3.5 h-3.5" />
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="w-3.5 h-3.5" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {message.type === "image" && message.attachment && (
                  <img src={message.attachment} alt="Uploaded" className="max-w-full rounded-lg mb-1.5" />
                )}
                {message.type === "voice" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-0.5 bg-current rounded-full opacity-50" style={{ height: `${Math.random() * 14 + 4}px` }} />
                      ))}
                    </div>
                  </div>
                )}
                {message.role === "bot" ? (
                  <div className="prose prose-sm max-w-none [&>*]:my-0.5 [&_p]:my-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 text-inherit">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <Avatar className="w-7 h-7 mt-1">
                <AvatarImage src="/icons/uberfix-icon.gif" alt="Bot" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <Bot className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted px-3 py-2.5 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-3 py-1.5 border-t border-border shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action)}
              className="shrink-0 px-2.5 py-1 text-[11px] bg-muted hover:bg-accent/20 rounded-full text-foreground transition-colors border border-border"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-3 py-2.5 border-t border-border shrink-0" style={{ background: 'hsl(var(--background))' }}>
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mb-2 py-1.5 px-3 bg-destructive/10 rounded-full">
            <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs text-destructive font-medium">
              {isRTL ? `جاري التسجيل... ${recordingTime}ث` : `Recording... ${recordingTime}s`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 mb-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => cameraInputRef.current?.click()} className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted" title={isRTL ? "تصوير مباشر" : "Take photo"}>
            <Camera className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted" title={isRTL ? "رفع صورة" : "Upload image"}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted" title={isRTL ? "إرفاق ملف" : "Attach file"}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={handleVoiceRecord} className={`h-7 w-7 transition-colors ${isRecording ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`} title={isRTL ? "تسجيل صوتي" : "Voice note"}>
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isRTL ? "اكتب رسالتك..." : "Type your message..."}
            className="flex-1 rounded-full bg-muted border-0 h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
            disabled={isRecording || isTyping}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isRecording || isTyping}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 h-9 w-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatBotPanel;
