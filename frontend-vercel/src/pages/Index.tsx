
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TopUtilityBar from "@/components/TopUtilityBar";
import MainNavigation from "@/components/MainNavigation";
import SearchBar from "@/components/SearchBar";
import FeaturedProcedures from "@/components/FeaturedProcedures";
import Footer from "@/components/Footer";
import { ResultModal } from "@/components/ui/ResultModal";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Update title
    document.title = "Medora Health | Medical Tourism & Telemedicine in China";

    // 检查是否是从 Case Intake 提交后跳转过来的
    if (searchParams.get('caseIntakeSubmitted') === 'true') {
      setShowSuccessModal(true);
      // 清除 URL 参数
      searchParams.delete('caseIntakeSubmitted');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen">
      <TopUtilityBar />
      <MainNavigation />
      <SearchBar />
      <FeaturedProcedures />
      <Footer />

      {/* Case Intake 提交成功弹窗 */}
      <ResultModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title={t('caseIntake.submitSuccess.title') || 'Medical Case Form Submitted Successfully!'}
        message={t('caseIntake.submitSuccess.message') || 'Thank you for submitting your medical case information. Our medical specialists will review your case and contact you within 24-48 hours with personalized recommendations. Please check your email for a confirmation with all the details you provided.'}
        showCaseIntakeCTA={false}
      />
    </div>
  );
};

export default Index;
