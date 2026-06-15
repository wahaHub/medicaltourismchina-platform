import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import badgeBasic from "@/img/badge-basic.png";
import badgeGold from "@/img/badge-gold.png";
import badgeDiamond from "@/img/badge-diamond.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const basicFeatures = [
  { text: "Medical Invitation Letter (For Visa Use)" },
  { text: "Priority Hospital Appointment Scheduling" },
  { text: "Airport pickup&Drop-off" },
  { text: "Daily Online Concierge Support (10:00 AM – 6:00 PM, 7 Days via WeChat / WhatsApp/Message)" },
  { text: "Professional Medical Records Translation & Organization" },
  { text: "In-Hospital Medical Interpretation" },
  { text: "Hotel Booking Assistance" },
];

const goldFeatures = [
  { text: "Medical Invitation Letter (For Visa Use)" },
  { text: "Priority Hospital Appointment Scheduling" },
  { text: "Airport pickup&Drop-off" },
  { text: "Daily Online Concierge Support (10:00 AM – 6:00 PM, 7 Days via WeChat / WhatsApp/Message)" },
  { text: "Professional Medical Records Translation & Organization" },
  { text: "In-Hospital Medical Interpretation" },
  { text: "Hotel Booking Assistance" },
  { text: "7-Night Stay in a Comfortable Hotel Near the Hospital – Included", bold: true },
  { text: "1-on-1 In-Hospital Accompaniment (2 Days)", bold: true },
];

const diamondFeatures = [
  { text: "Medical Invitation Letter (For Visa Use)" },
  { text: "Priority Hospital Appointment Scheduling" },
  { text: "Airport pickup&Drop-off" },
  { text: "Daily Online Concierge Support (10:00 AM – 6:00 PM, 7 Days via WeChat / WhatsApp/Message)" },
  { text: "Professional Medical Records Translation & Organization" },
  { text: "In-Hospital Medical Interpretation" },
  { text: "Hotel Booking Assistance" },
  { text: "7-Night Stay in a 5 Star Hotel Near the Hospital – Included", bold: true },
  { text: "1-on-1 In-Hospital Accompaniment (Unlimited Days)", bold: true },
  { text: "1-on-1 Personal Assistance Outside the Hospital (Up to 3 Days)", bold: true },
  { text: "1-on-1 Online Doctor Consultation (Available Daily, 10:00 AM – 6:00 PM, Up to 7 Days, Response Within 30 Minutes)", bold: true },
];

export default function HealthPackages() {
  useEffect(() => {
    document.title = "Service Packages | Medora Health";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBanner />
      <Header />

      <main className={`${fixedChromePadding} pb-16 sm:pb-20`}>
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-center text-foreground">
              Package Description
            </h1>
            <p className="text-center text-muted-foreground mt-3 mb-12 text-base">
              For patients receiving treatment at our in-network hospitals only
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <PricingCard badge={badgeBasic} title="Basic Package" price="Free" features={basicFeatures} />
              <PricingCard badge={badgeGold} title="Gold Package" price="$599" features={goldFeatures} showBooking href="https://wise.com/pay/r/mWRRokGUVWs66mk" />
              <PricingCard badge={badgeDiamond} title="Diamond VIP Package" price="$2499" features={diamondFeatures} showBooking href="https://wise.com/pay/r/0dw2o3FMnhHv1mw" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
