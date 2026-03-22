import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wrench, Send, CheckCircle, AlertCircle, MapPin, Phone, Mail, User, FileText, Tag, Layers } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-request`;

export interface MaintenanceFormData {
  title: string;
  description: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  location: string;
  service_type: string;
  priority: string;
  customer_notes: string;
  category_id: string;
  latitude: string;
  longitude: string;
}

const initialFormData: MaintenanceFormData = {
  title: "",
  description: "",
  client_name: "",
  client_phone: "",
  client_email: "",
  location: "",
  service_type: "",
  priority: "medium",
  customer_notes: "",
  category_id: "",
  latitude: "",
  longitude: "",
};

export async function submitMaintenanceRequest(data: MaintenanceFormData, channel = "website") {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ ...data, channel }),
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(result.error || result.message || "Failed to submit");
  return result;
}

export async function queryMaintenanceRequest(params: { request_number?: string; client_phone?: string }) {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const resp = await fetch(`${API_URL}?${query}`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(result.error || "Failed to query");
  return result;
}

const serviceTypes = [
  { value: "plumbing", labelAr: "سباكة", labelEn: "Plumbing" },
  { value: "electrical", labelAr: "كهرباء", labelEn: "Electrical" },
  { value: "ac", labelAr: "تكييف", labelEn: "AC Repair" },
  { value: "painting", labelAr: "دهانات", labelEn: "Painting" },
  { value: "carpentry", labelAr: "نجارة", labelEn: "Carpentry" },
  { value: "cleaning", labelAr: "تنظيف", labelEn: "Cleaning" },
  { value: "furniture", labelAr: "تجميع أثاث", labelEn: "Furniture Assembly" },
  { value: "general", labelAr: "صيانة عامة", labelEn: "General Maintenance" },
];

const MaintenanceRequest = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { toast } = useToast();
  const [formData, setFormData] = useState<MaintenanceFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");

  const handleChange = (field: keyof MaintenanceFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name.trim() || !formData.client_phone.trim() || !formData.title.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^[\d+\-() ]{8,20}$/;
    if (!phoneRegex.test(formData.client_phone)) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "رقم الهاتف غير صالح" : "Invalid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitMaintenanceRequest(formData);
      setIsSuccess(true);
      setRequestNumber(result.data?.request_number || "");
      toast({
        title: isRTL ? "تم الإرسال بنجاح" : "Submitted Successfully",
        description: isRTL
          ? `تم تسجيل طلب الصيانة ${result.data?.request_number || ""}`
          : `Maintenance request ${result.data?.request_number || ""} created`,
      });
    } catch (err: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Navigation />
        <div className="pt-24 pb-16 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md"
          >
            <CheckCircle className="w-20 h-20 text-secondary mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isRTL ? "تم تسجيل طلبك بنجاح!" : "Request Submitted Successfully!"}
            </h2>
            {requestNumber && (
              <p className="text-lg text-primary font-semibold mb-2">
                {isRTL ? `رقم الطلب: ${requestNumber}` : `Request #: ${requestNumber}`}
              </p>
            )}
            <p className="text-muted-foreground mb-6">
              {isRTL
                ? "سيتواصل معك فريقنا في أقرب وقت ممكن"
                : "Our team will contact you as soon as possible"}
            </p>
            <Button onClick={() => { setIsSuccess(false); setFormData(initialFormData); }}>
              {isRTL ? "طلب جديد" : "New Request"}
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Wrench className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {isRTL ? "طلب صيانة جديد" : "New Maintenance Request"}
            </h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto">
              {isRTL
                ? "املأ النموذج التالي وسيتم التواصل معك خلال دقائق"
                : "Fill out the form below and we'll get back to you shortly"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    {isRTL ? "البيانات الشخصية" : "Personal Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? "الاسم *" : "Name *"}</Label>
                    <Input
                      value={formData.client_name}
                      onChange={(e) => handleChange("client_name", e.target.value)}
                      placeholder={isRTL ? "الاسم الكامل" : "Full name"}
                      required
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? "رقم الهاتف *" : "Phone *"}</Label>
                    <div className="relative">
                      <Phone className="absolute top-2.5 start-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.client_phone}
                        onChange={(e) => handleChange("client_phone", e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="ps-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                    <div className="relative">
                      <Mail className="absolute top-2.5 start-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => handleChange("client_email", e.target.value)}
                        placeholder="email@example.com"
                        className="ps-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wrench className="w-5 h-5 text-primary" />
                    {isRTL ? "تفاصيل الخدمة" : "Service Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{isRTL ? "عنوان الطلب *" : "Request Title *"}</Label>
                    <div className="relative">
                      <FileText className="absolute top-2.5 start-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder={isRTL ? "مثال: إصلاح تسريب مياه" : "e.g. Fix water leak"}
                        className="ps-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{isRTL ? "نوع الخدمة" : "Service Type"}</Label>
                      <Select value={formData.service_type} onValueChange={(v) => handleChange("service_type", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? "اختر نوع الخدمة" : "Select service"} />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {isRTL ? s.labelAr : s.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{isRTL ? "الأولوية" : "Priority"}</Label>
                      <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{isRTL ? "منخفضة" : "Low"}</SelectItem>
                          <SelectItem value="medium">{isRTL ? "متوسطة" : "Medium"}</SelectItem>
                          <SelectItem value="high">{isRTL ? "عالية" : "High"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{isRTL ? "الوصف التفصيلي" : "Detailed Description"}</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={isRTL ? "اشرح المشكلة بالتفصيل..." : "Describe the issue in detail..."}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    {isRTL ? "الموقع" : "Location"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{isRTL ? "العنوان" : "Address"}</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder={isRTL ? "العنوان بالتفصيل" : "Full address"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{isRTL ? "خط العرض" : "Latitude"}</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => handleChange("latitude", e.target.value)}
                        placeholder="30.0444"
                      />
                    </div>
                    <div>
                      <Label>{isRTL ? "خط الطول" : "Longitude"}</Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => handleChange("longitude", e.target.value)}
                        placeholder="31.2357"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="w-5 h-5 text-primary" />
                    {isRTL ? "ملاحظات إضافية" : "Additional Notes"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.customer_notes}
                    onChange={(e) => handleChange("customer_notes", e.target.value)}
                    placeholder={isRTL ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isRTL
                  ? isSubmitting ? "جاري الإرسال..." : "إرسال طلب الصيانة"
                  : isSubmitting ? "Submitting..." : "Submit Maintenance Request"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MaintenanceRequest;
