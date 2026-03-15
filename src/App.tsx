import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEOHead from "@/components/SEOHead";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";

// Eager load the main page
import Index from "./pages/Index";

// Lazy load all other pages
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Branches = lazy(() => import("./pages/Branches"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TechnicianLanding = lazy(() => import("./pages/TechnicianLanding"));
const Partners = lazy(() => import("./pages/Partners"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Help = lazy(() => import("./pages/Help"));
const QualityStandards = lazy(() => import("./pages/QualityStandards"));
const LuxuryFinishing = lazy(() => import("./pages/LuxuryFinishing"));
const BrandIdentity = lazy(() => import("./pages/BrandIdentity"));
const LabnElAsfor = lazy(() => import("./pages/LabnElAsfor"));
const LiveMap = lazy(() => import("./pages/LiveMap"));
const EnterpriseServices = lazy(() => import("./pages/EnterpriseServices"));
const MaterialsPricing = lazy(() => import("./pages/MaterialsPricing"));
const Founder = lazy(() => import("./pages/Founder"));
const Install = lazy(() => import("./pages/Install"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatBotSettings = lazy(() => import("./pages/ChatBotSettings"));
const MaintenanceRequest = lazy(() => import("./pages/MaintenanceRequest"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm animate-pulse">جاري التحميل...</p>
    </div>
  </div>
);

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    <PageTransition>{children}</PageTransition>
  </Suspense>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SEOHead />
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/services" element={<LazyPage><Services /></LazyPage>} />
              <Route path="/projects" element={<LazyPage><Projects /></LazyPage>} />
              <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
              <Route path="/about" element={<LazyPage><AboutPage /></LazyPage>} />
              <Route path="/branches" element={<LazyPage><Branches /></LazyPage>} />
              <Route path="/faq" element={<LazyPage><FAQ /></LazyPage>} />
              <Route path="/technicians" element={<LazyPage><TechnicianLanding /></LazyPage>} />
              <Route path="/partners" element={<LazyPage><Partners /></LazyPage>} />
              <Route path="/terms" element={<LazyPage><Terms /></LazyPage>} />
              <Route path="/privacy" element={<LazyPage><Privacy /></LazyPage>} />
              <Route path="/help" element={<LazyPage><Help /></LazyPage>} />
              <Route path="/quality-standards" element={<LazyPage><QualityStandards /></LazyPage>} />
              <Route path="/luxury-finishing" element={<LazyPage><LuxuryFinishing /></LazyPage>} />
              <Route path="/brand-identity" element={<LazyPage><BrandIdentity /></LazyPage>} />
              <Route path="/labn-el-asfor" element={<LazyPage><LabnElAsfor /></LazyPage>} />
              <Route path="/live-map" element={<LazyPage><LiveMap /></LazyPage>} />
              <Route path="/enterprise" element={<LazyPage><EnterpriseServices /></LazyPage>} />
              <Route path="/pricing" element={<LazyPage><MaterialsPricing /></LazyPage>} />
              <Route path="/founder" element={<LazyPage><Founder /></LazyPage>} />
              <Route path="/install" element={<LazyPage><Install /></LazyPage>} />
              <Route path="/portfolio" element={<LazyPage><Portfolio /></LazyPage>} />
              <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
              <Route path="/chatbot-settings" element={<LazyPage><ChatBotSettings /></LazyPage>} />
              <Route path="/maintenance-request" element={<LazyPage><MaintenanceRequest /></LazyPage>} />
              <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
