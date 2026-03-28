import { ClipboardList, UserCheck, Wrench, CheckCircle, type LucideIcon } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface TimelineStepItem {
  icon: LucideIcon;
  numberKey: string;
  titleKey: string;
  descKey: string;
  featuresKey: string;
}

const MaintenanceTimeline = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  const timelineSteps: TimelineStepItem[] = [
    {
      icon: ClipboardList,
      numberKey: "maintenanceTimeline.step1Number",
      titleKey: "maintenanceTimeline.step1Title",
      descKey: "maintenanceTimeline.step1Desc",
      featuresKey: "maintenanceTimeline.step1Features"
    },
    {
      icon: UserCheck,
      numberKey: "maintenanceTimeline.step2Number",
      titleKey: "maintenanceTimeline.step2Title",
      descKey: "maintenanceTimeline.step2Desc",
      featuresKey: "maintenanceTimeline.step2Features"
    },
    {
      icon: Wrench,
      numberKey: "maintenanceTimeline.step3Number",
      titleKey: "maintenanceTimeline.step3Title",
      descKey: "maintenanceTimeline.step3Desc",
      featuresKey: "maintenanceTimeline.step3Features"
    },
    {
      icon: CheckCircle,
      numberKey: "maintenanceTimeline.step4Number",
      titleKey: "maintenanceTimeline.step4Title",
      descKey: "maintenanceTimeline.step4Desc",
      featuresKey: "maintenanceTimeline.step4Features"
    }
  ];

  return (
    <section className="py-20 bg-muted/50" dir={isRTL ? 'rtl' : 'ltr'}>
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("maintenanceTimeline.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("maintenanceTimeline.subtitle")}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Timeline Line with Animation */}
          <div className={`hidden md:block absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-secondary to-secondary/30 transform ${isRTL ? 'translate-x-1/2' : '-translate-x-1/2'} progress-line`} />

          <div className="space-y-12 md:space-y-0">
            {timelineSteps.map((step, index) => (
              <TimelineStep key={index} step={step} index={index} t={t} isRTL={isRTL} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface TimelineStepProps {
  step: TimelineStepItem;
  index: number;
  t: TFunction;
  isRTL: boolean;
}

const TimelineStep = ({ step, index, t, isRTL }: TimelineStepProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const isEven = index % 2 === 0;
  
  const features = t(step.featuresKey).split(',');

  return (
    <div 
      ref={ref}
      className={`relative ${isEven ? (isRTL ? 'md:pl-[52%]' : 'md:pr-[52%]') : (isRTL ? 'md:pr-[52%] md:text-right' : 'md:pl-[52%] md:text-left')}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translateX(0)' 
          : `translateX(${isEven ? (isRTL ? '-50px' : '50px') : (isRTL ? '50px' : '-50px')})`,
        transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`
      }}
    >
      {/* Timeline Node */}
      <div 
        className={`hidden md:flex absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-8 transform ${isRTL ? 'translate-x-1/2' : '-translate-x-1/2'} w-16 h-16 bg-secondary rounded-full items-center justify-center z-10 shadow-lg cursor-pointer glow-effect ${isVisible ? 'timeline-node' : ''}`}
        style={{
          transform: isVisible ? `translateX(${isRTL ? '50%' : '-50%'}) scale(1)` : `translateX(${isRTL ? '50%' : '-50%'}) scale(0)`,
          transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15 + 0.2}s`
        }}
      >
        <span className="text-secondary-foreground font-bold text-lg">{t(step.numberKey)}</span>
      </div>

      {/* Card */}
      <div className={`bg-card border border-border rounded-2xl p-6 shadow-md interactive-card ${isEven ? (isRTL ? 'md:ml-8' : 'md:mr-8') : (isRTL ? 'md:mr-8' : 'md:ml-8')}`}>
        {/* Mobile Number Badge */}
        <div className="md:hidden flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center glow-effect">
            <span className="text-secondary-foreground font-bold">{t(step.numberKey)}</span>
          </div>
          <step.icon className="w-6 h-6 text-secondary icon-bounce" />
        </div>

        <div className={`hidden md:block mb-4 ${isEven ? '' : (isRTL ? 'text-right' : 'text-left')}`}>
          <step.icon className="w-8 h-8 text-secondary inline-block icon-bounce" />
        </div>

        <h3 className={`text-xl font-bold text-foreground mb-3 ${isEven ? '' : (isRTL ? 'md:text-right' : 'md:text-left')}`}>
          {t(step.titleKey)}
        </h3>
        
        <p className={`text-muted-foreground mb-4 leading-relaxed ${isEven ? '' : (isRTL ? 'md:text-right' : 'md:text-left')}`}>
          {t(step.descKey)}
        </p>

        <ul className={`space-y-2 ${isEven ? '' : (isRTL ? 'md:text-right' : 'md:text-left')}`}>
          {features.map((feature: string, fIndex: number) => (
            <li 
              key={fIndex} 
              className={`flex items-center gap-2 text-sm text-muted-foreground ${isEven ? '' : (isRTL ? 'md:flex-row-reverse' : '')}`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
                transition: `all 0.4s ease ${fIndex * 0.1 + 0.3}s`
              }}
            >
              <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
              {feature.trim()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MaintenanceTimeline;
