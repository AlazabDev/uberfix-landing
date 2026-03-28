import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, X, Loader2, Phone, Hash, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  queryMaintenanceRequest,
  type MaintenanceRequestQueryResult,
  type MaintenanceRequestSummary,
} from "@/lib/maintenance-request";

interface ChatTrackingFormProps {
  onClose: () => void;
  onResult: (summary: string) => void;
}

const ChatTrackingForm = ({ onClose, onResult }: ChatTrackingFormProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [searchBy, setSearchBy] = useState<"request_number" | "client_phone">("request_number");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setIsLoading(true);
    try {
      const result: MaintenanceRequestQueryResult = await queryMaintenanceRequest({ [searchBy]: value.trim() });

      if (!result || (Array.isArray(result.data) && result.data.length === 0)) {
        onResult(
          isRTL
            ? "❌ لم يتم العثور على طلبات صيانة بهذه البيانات."
            : "❌ No maintenance requests found with this information."
        );
        return;
      }

      const requests = Array.isArray(result.data) ? result.data : [result.data];
      const lines = requests.map((r: MaintenanceRequestSummary) => {
        const status = r.status || "pending";
        const icon = status === "completed" ? "✅" : status === "in_progress" ? "🔄" : "⏳";
        return isRTL
          ? `${icon} **${r.request_number}** — ${r.title || "طلب صيانة"}\n   الحالة: ${status} | الأولوية: ${r.priority || "متوسطة"}`
          : `${icon} **${r.request_number}** — ${r.title || "Maintenance request"}\n   Status: ${status} | Priority: ${r.priority || "medium"}`;
      });

      const header = isRTL
        ? `📋 تم العثور على ${requests.length} طلب(ات):\n\n`
        : `📋 Found ${requests.length} request(s):\n\n`;

      onResult(header + lines.join("\n\n"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : isRTL ? "حدث خطأ غير متوقع" : "An unexpected error occurred";
      onResult(
        isRTL
          ? `❌ خطأ في الاستعلام: ${message}`
          : `❌ Query error: ${message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mb-2 p-3 rounded-xl border border-border bg-muted/50"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary" />
          {isRTL ? "تتبع طلب الصيانة" : "Track Maintenance Request"}
        </h4>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => { setSearchBy("request_number"); setValue(""); }}
          className={`flex-1 text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            searchBy === "request_number"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground border border-border"
          }`}
        >
          <Hash className="w-3 h-3" />
          {isRTL ? "رقم الطلب" : "Request #"}
        </button>
        <button
          type="button"
          onClick={() => { setSearchBy("client_phone"); setValue(""); }}
          className={`flex-1 text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors ${
            searchBy === "client_phone"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground border border-border"
          }`}
        >
          <Phone className="w-3 h-3" />
          {isRTL ? "رقم الهاتف" : "Phone"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            searchBy === "request_number"
              ? (isRTL ? "MR-25-XXXXX" : "MR-25-XXXXX")
              : (isRTL ? "01XXXXXXXXX" : "01XXXXXXXXX")
          }
          className="flex-1 h-8 text-xs"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={!value.trim() || isLoading} className="h-8 px-3 text-xs">
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </Button>
      </form>
    </motion.div>
  );
};

export default ChatTrackingForm;
