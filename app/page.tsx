// pages/index.tsx
import VendorRegister from "@/components/restaurantRegistration/VendorRegistrationForm";
import { OpportunitiesSection } from "@/components/restaurantRegistration/OpportunitiesSection";
import { PartnerSection } from "@/components/restaurantRegistration/PartnerSection";
import { TestimonialSection } from "@/components/restaurantRegistration/TestimonialSection";
import {FAQSection} from "@/components/restaurantRegistration/FAQSection";
const HomePage = () => (
  <div>
       <VendorRegister />
       <OpportunitiesSection />
       <PartnerSection/>
       <TestimonialSection />
       <FAQSection/>
  </div>
);

export default HomePage;
