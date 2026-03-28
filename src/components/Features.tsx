import { Card } from "@/components/ui/card";
import { Users, ClipboardCheck, Zap, Shield, Clock, TrendingUp, type LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface FeatureItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const Features = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  const features: FeatureItem[] = [
    { icon: Users, titleKey: "features.feature1Title", descKey: "features.feature1Desc" },
    { icon: ClipboardCheck, titleKey: "features.feature2Title", descKey: "features.feature2Desc" },
    { icon: Zap, titleKey: "features.feature3Title", descKey: "features.feature3Desc" },
    { icon: Shield, titleKey: "features.feature4Title", descKey: "features.feature4Desc" },
    { icon: Clock, titleKey: "features.feature5Title", descKey: "features.feature5Desc" },
    { icon: TrendingUp, titleKey: "features.feature6Title", descKey: "features.feature6Desc" },
  ];

  return (
    <section className="py-20 bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className="text-center mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("features.title")} <span className="text-primary">{t("features.titleHighlight")}</span>؟
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
  t: TFunction;
}

const FeatureCard = ({ feature, index, t }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <Card 
      ref={ref}
      className="p-6 bg-card border-border cursor-pointer interactive-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`
      }}
    >
      <div className="flex flex-col items-center text-center group">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 glow-effect">
          <feature.icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors duration-300">
          {t(feature.titleKey)}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {t(feature.descKey)}
        </p>
      </div>
    </Card>
  );
};

export default Features;
