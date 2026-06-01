import CommonHero from "@/components/medical-enquiry/CommonHero";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DoctorAppointmentHero() {
  const { t } = useLanguage();

  return (
    <CommonHero
      title={t('doctorAppointment.hero.title')}
      subtitle={t('doctorAppointment.hero.subtitle')}
      backgroundImage="/figma-assets/doctor-appointment.png"
      gradientFrom="#14B8A6"
      gradientTo="#14B8A6"
    />
  );
}
