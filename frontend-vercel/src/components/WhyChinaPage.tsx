import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import WhyChinaHero from "@/components/why-china/WhyChinaHero";
import WhyChinaAdvantages from "@/components/why-china/WhyChinaAdvantages";
import Footer from "@/components/Footer";

export default function WhyChinaPage() {
  return (
    <div className="min-h-screen">
      <TopBanner />
      <Header />
      <WhyChinaHero />
      <WhyChinaAdvantages />
      <Footer />
    </div>
  );
}
