import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

const defaultSEO = {
  title: 'UberFix - نظام إدارة الصيانة | شركة العزب المعمارية',
  description: 'منصة شاملة لإدارة طلبات الصيانة وربط العملاء بالفنيين المحترفين. أكثر من 500 فني و5000 طلب صيانة في مصر.',
  image: 'https://uberfix.shop/upload/uber-hero.jpg',
  type: 'website',
};

const pageSEO: Record<string, { title: string; description: string }> = {
  '/': { title: 'UberFix - نظام إدارة الصيانة الذكي', description: 'منصة UberFix لإدارة الصيانة الذكية - أكثر من 500 فني محترف و5000 طلب صيانة في مصر' },
  '/services': { title: 'خدماتنا | UberFix', description: 'خدمات صيانة شاملة تشمل التشطيبات الفاخرة والهوية التجارية وصيانة المباني والمنشآت' },
  '/projects': { title: 'مشاريعنا | UberFix', description: 'استعرض مشاريع الصيانة والتشطيبات المنفذة بأعلى معايير الجودة' },
  '/about': { title: 'عن الشركة | UberFix', description: 'تعرف على شركة العزب المعمارية وفريق UberFix المتخصص في إدارة الصيانة' },
  '/contact': { title: 'تواصل معنا | UberFix', description: 'تواصل مع فريق UberFix لطلب خدمات الصيانة أو الاستفسار' },
  '/portfolio': { title: 'معرض الأعمال | UberFix', description: 'معرض صور وفيديوهات لأعمال الصيانة والتشطيبات المنفذة' },
  '/branches': { title: 'الفروع | UberFix', description: 'فروع UberFix في مختلف المحافظات المصرية' },
  '/faq': { title: 'الأسئلة الشائعة | UberFix', description: 'إجابات على الأسئلة الأكثر شيوعاً حول خدمات UberFix' },
  '/technicians': { title: 'انضم كفني | UberFix', description: 'انضم لفريق UberFix كفني محترف واحصل على فرص عمل مستمرة' },
  '/enterprise': { title: 'خدمات الشركات | UberFix', description: 'حلول صيانة متكاملة للشركات والمؤسسات الكبرى' },
  '/luxury-finishing': { title: 'التشطيبات الفاخرة | UberFix', description: 'خدمات تشطيب فاخرة بأعلى معايير الجودة والتصميم' },
  '/founder': { title: 'المؤسس | UberFix', description: 'تعرف على مؤسس شركة العزب المعمارية ورؤيته' },
};

const SEOHead = ({ title, description, image, type }: SEOHeadProps) => {
  const location = useLocation();
  const page = pageSEO[location.pathname];
  
  const seo = {
    title: title || page?.title || defaultSEO.title,
    description: description || page?.description || defaultSEO.description,
    image: image || defaultSEO.image,
    type: type || defaultSEO.type,
  };

  useEffect(() => {
    document.title = seo.title;
    
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', seo.description);
    setMeta('og:title', seo.title);
    setMeta('og:description', seo.description);
    setMeta('og:image', seo.image);
    setMeta('og:type', seo.type);
    setMeta('og:url', `https://uberfix.shop${location.pathname}`);
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', seo.image);

    // JSON-LD structured data
    let script = document.getElementById('json-ld-seo');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-seo';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    
    const jsonLd = location.pathname === '/' ? {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'UberFix - شركة العزب المعمارية',
      url: 'https://uberfix.shop',
      logo: 'https://uberfix.shop/icons/app-icon-512.png',
      description: seo.description,
      address: { '@type': 'PostalAddress', addressCountry: 'EG' },
      sameAs: [],
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['ar', 'en'] },
    } : {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seo.title,
      description: seo.description,
      url: `https://uberfix.shop${location.pathname}`,
      isPartOf: { '@type': 'WebSite', name: 'UberFix', url: 'https://uberfix.shop' },
    };
    
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const s = document.getElementById('json-ld-seo');
      if (s) s.remove();
    };
  }, [seo.title, seo.description, seo.image, seo.type, location.pathname]);

  return null;
};

export default SEOHead;
