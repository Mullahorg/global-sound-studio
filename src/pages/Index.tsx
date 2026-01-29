import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { TrustedBySection } from "@/components/home/TrustedBySection";
import { BookSessionCTA } from "@/components/home/BookSessionCTA";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { OutreachSection } from "@/components/home/OutreachSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/layout/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { AnnouncementBanner } from "@/components/home/AnnouncementBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="World-Class Music Production"
        description="WE Global connects artists, producers, and labels through professional music production, mixing, mastering, and beat licensing. Book a session today."
        path="/"
      />
      <Navbar />
      <main>
        <div className="container mx-auto px-6 pt-24">
          <AnnouncementBanner />
        </div>
        <HeroSection />
        <TrustedBySection />
        <ServicesSection />
        <FeaturedSection />
        <OutreachSection />
        <BookSessionCTA />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
