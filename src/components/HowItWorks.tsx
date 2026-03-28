import { CheckCircle, Calendar, Wrench, Star, type LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface StepItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const HowItWorks = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  const steps: StepItem[] = [
    { icon: CheckCircle, titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc" },
    { icon: Calendar, titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc" },
    { icon: Wrench, titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc" },
    { icon: Star, titleKey: "howItWorks.step4Title", descKey: "howItWorks.step4Desc" }
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
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            {t("howItWorks.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} totalSteps={steps.length} t={t} isRTL={isRTL} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StepCardProps {
  step: StepItem;
  index: number;
  totalSteps: number;
  t: TFunction;
  isRTL: boolean;
}

const StepCard = ({ step, index, totalSteps, t, isRTL }: StepCardProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className="relative group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`
      }}
    >
      <div className="bg-card rounded-2xl p-8 text-center shadow-lg border border-border/50 hover:border-secondary/50 interactive-card cursor-pointer">
        <div 
          className={`absolute -top-4 ${isRTL ? 'right-4' : 'left-4'} w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm glow-effect`}
          style={{
            transform: isVisible ? 'scale(1)' : 'scale(0)',
            transition: `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15 + 0.2}s`
          }}
        >
          {index + 1}
        </div>
        
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <step.icon className="w-8 h-8 text-primary icon-bounce" />
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors duration-300">
          {t(step.titleKey)}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t(step.descKey)}
        </p>
      </div>
      
      {index < totalSteps - 1 && (
        <div 
          className={`hidden lg:block absolute top-1/2 ${isRTL ? '-right-4' : '-left-4'} w-8 h-0.5 bg-secondary/50`}
          style={{
            transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: isRTL ? 'left' : 'right',
            transition: `all 0.4s ease ${index * 0.15 + 0.4}s`
          }}
        />
      )}
    </div>
  );
};

export default HowItWorks;
