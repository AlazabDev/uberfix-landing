import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Send, CheckCircle, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitMaintenanceRequest, type MaintenanceFormData } from "@/pages/MaintenanceRequest";

interface ChatMaintenanceFormProps {
  onClose: () => void;
  onSuccess: (requestNumber: string) => void;
}

const serviceTypes = [
  { value: "plumbing", labelAr: "سباكة", labelEn: "Plumbing" },
  { value: "electrical", labelAr: "كهرباء", labelEn: "Electrical" },
  { value: "ac", labelAr: "تكييف", labelEn: "AC Repair" },
  { value: "painting", labelAr: "دهانات", labelEn: "Painting" },
  { value: "carpentry", labelAr: "نجارة", labelEn: "Carpentry" },
  { value: "cleaning", labelAr: "تنظيف", labelEn: "Cleaning" },
  { value: "general", labelAr: "صيانة عامة", labelEn: "General Maintenance" },
];

const ChatMaintenanceForm = ({ onClose, onSuccess }: ChatMaintenanceFormProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    title: "", description: "", client_name: "", client_phone: "", client_email: "",
    location: "", service_type: "", priority: "medium", customer_notes: "",
    category_id: "", latitude: "", longitude: "",
  });

  const handleChange = (field: keyof MaintenanceFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.client_phone.trim() || !formData.title.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await submitMaintenanceRequest(formData, "chatbot");
      onSuccess(result.data?.request_number || "");
    } catch {
      onSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-3 mx-1 my-2 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-primary" />
          {isRTL ? "طلب صيانة سريع" : "Quick Maintenance Request"}
        </h4>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <Label className="text-xs">{isRTL ? "الاسم *" : "Name *"}</Label>
          <Input className="h-8 text-xs" value={formData.client_name} onChange={(e) => handleChange("client_name", e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs">{isRTL ? "الهاتف *" : "Phone *"}</Label>
          <Input className="h-8 text-xs" value={formData.client_phone} onChange={(e) => handleChange("client_phone", e.target.value)} placeholder="01XXXXXXXXX" required />
        </div>
        <div>
          <Label className="text-xs">{isRTL ? "عنوان الطلب *" : "Title *"}</Label>
          <Input className="h-8 text-xs" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder={isRTL ? "مثال: إصلاح تسريب" : "e.g. Fix leak"} required />
        </div>
        <div>
          <Label className="text-xs">{isRTL ? "نوع الخدمة" : "Service"}</Label>
          <Select value={formData.service_type} onValueChange={(v) => handleChange("service_type", v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={isRTL ? "اختر" : "Select"} /></SelectTrigger>
            <SelectContent>
              {serviceTypes.map((s) => (
                <SelectItem key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{isRTL ? "الموقع" : "Location"}</Label>
          <Input className="h-8 text-xs" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{isRTL ? "الوصف" : "Description"}</Label>
          <Textarea className="text-xs min-h-[50px]" rows={2} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
        </div>

        <Button type="submit" className="w-full h-8 text-xs gap-1.5" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {isRTL ? (isSubmitting ? "جاري الإرسال..." : "إرسال الطلب") : (isSubmitting ? "Sending..." : "Submit Request")}
        </Button>
      </form>
    </motion.div>
  );
};

export default ChatMaintenanceForm;
