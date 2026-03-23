import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Wrench, Shield, DollarSign, ArrowLeft, ArrowRight } from "lucide-react";

const TechnicianSignup = () => {
  const { t } = useTranslation();
  const isRTL = document.documentElement.dir === 'rtl';

  const features = [
    {
      icon: Wrench,
      title: t("techSignup.feature1Title", "فرص عمل مستمرة"),
      desc: t("techSignup.feature1Desc", "طلبات صيانة يومية في منطقتك"),
    },
    {
      icon: DollarSign,
      title: t("techSignup.feature2Title", "دخل مجزي"),
      desc: t("techSignup.feature2Desc", "عمولات عادلة وتحويلات فورية"),
    },
    {
      icon: Shield,
      title: t("techSignup.feature3Title", "دعم كامل"),
      desc: t("techSignup.feature3Desc", "تدريب وأدوات ودعم فني على مدار الساعة"),
    },
  ];

  return (
    <section className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10" dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("techSignup.title", "انضم لفريق فنيي UberFix")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("techSignup.subtitle", "سجّل الآن وابدأ في تلقي طلبات الصيانة وزيادة دخلك")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl bg-muted/50 border border-border">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 text-lg px-8"
          >
            <a href="https://uberfix.shop/technicians/registration" target="_blank" rel="noopener noreferrer">
              {t("techSignup.cta", "سجّل كفني الآن")}
              {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TechnicianSignup;
