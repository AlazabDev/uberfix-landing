import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = document.documentElement.dir === 'rtl';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast({
      title: t("footer.subscribeSuccess", "تم الاشتراك بنجاح!"),
      description: t("footer.subscribeSuccessDesc", "شكراً لاشتراكك في نشرتنا البريدية"),
    });
    setEmail("");
  };

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-6 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/icons/uberfix-icon.gif" 
                alt="UberFix" 
                className="w-12 h-12 rounded-xl bg-transparent"
                style={{ background: 'transparent' }}
              />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                UberFix
              </span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed max-w-md">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-primary-foreground mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="/" className="hover:text-secondary transition-colors">{t("nav.home")}</a></li>
              <li><a href="/services" className="hover:text-secondary transition-colors">{t("nav.services")}</a></li>
              <li><a href="/about" className="hover:text-secondary transition-colors">{t("nav.about")}</a></li>
              <li><a href="/contact" className="hover:text-secondary transition-colors">{t("nav.contact")}</a></li>
              <li><a href="/help" className="hover:text-secondary transition-colors">{t("nav.help")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary-foreground mb-4">{t("footer.ourServices")}</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="/luxury-finishing" className="hover:text-secondary transition-colors">{t("nav.luxury")}</a></li>
              <li><a href="/brand-identity" className="hover:text-secondary transition-colors">{t("nav.brand")}</a></li>
              <li><a href="/labn-elasfor" className="hover:text-secondary transition-colors">{t("nav.labn")}</a></li>
              <li><a href="/services" className="hover:text-secondary transition-colors">{t("nav.uberfix", "UberFix")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary-foreground mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="/terms" className="hover:text-secondary transition-colors">{t("footer.terms")}</a></li>
              <li><a href="/privacy" className="hover:text-secondary transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="/faq" className="hover:text-secondary transition-colors">{t("nav.faq")}</a></li>
              <li><a href="/technicians" className="hover:text-secondary transition-colors">{t("nav.technicians")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-primary-foreground mb-4">{t("footer.newsletter", "النشرة البريدية")}</h3>
            <p className="text-primary-foreground/70 text-sm mb-4">
              {t("footer.newsletterDesc", "اشترك للحصول على آخر العروض والأخبار")}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("footer.emailPlaceholder", "بريدك الإلكتروني")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ps-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  t("footer.subscribing", "جاري الاشتراك...")
                ) : (
                  <>
                    {t("footer.subscribe", "اشترك الآن")}
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-start">
          <p className="text-primary-foreground/60 text-sm">Al-Azab Construction Company… D-U-N-S No.: 849203826</p>
          <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
            <a href="/terms" className="hover:text-secondary transition-colors">{t("footer.termsShort")}</a>
            <span>|</span>
            <a href="/privacy" className="hover:text-secondary transition-colors">{t("footer.privacyShort")}</a>
            <span>|</span>
            <a href="https://uberfix.shop" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
              uberfix.shop
            </a>
          </div>
          <p className="text-primary-foreground/60 text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
