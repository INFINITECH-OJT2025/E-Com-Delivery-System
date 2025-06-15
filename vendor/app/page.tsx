import HeroSection from "@/components/landing/HeroSection";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import HowItWorks from "@/components/landing/HowItWorks";
import BenefitsCTA from "@/components/landing/BenefitsCTA";
import FaqSection from "@/components/landing/FaqSection";
import StatsSection from "@/components/landing/StatsSection";
import Testimonials from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <main className="">
      <HeroSection />
      <StatsSection />
      <FeatureHighlights />
      <HowItWorks />
      <Testimonials/>
      <FaqSection />
      <BenefitsCTA />
    </main>
  );
}
