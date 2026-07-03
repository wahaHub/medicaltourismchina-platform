import { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, Star } from "lucide-react";
import type { TranslationKey } from "@/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { handleInternalScroll } from "@/utils/routeScroll";

type FooterLinkItem =
  | {
      key: TranslationKey;
      href: string;
      external?: boolean;
      download?: boolean;
      placeholder?: false;
    }
  | {
      key: TranslationKey;
      placeholder: true;
    };

const Footer = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [showBangladeshContact, setShowBangladeshContact] = useState(false);
  const trustpilotProfileUrl = "https://www.trustpilot.com/review/medicaltourismchina.health";

  useEffect(() => {
    if (typeof fetch !== "function") return;

    let isMounted = true;

    const loadVisitorCountry = async () => {
      try {
        const response = await fetch("/api/visitor-country", {
          headers: { accept: "application/json" },
        });

        if (!response.ok) return;

        const data = await response.json() as { country?: string; isBangladesh?: boolean };
        if (isMounted) {
          setShowBangladeshContact(data.isBangladesh === true || data.country === "BD");
        }
      } catch {
        if (isMounted) {
          setShowBangladeshContact(false);
        }
      }
    };

    void loadVisitorCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  const packagesLinks: FooterLinkItem[] = [
    { key: "footer.servicePackages", href: "/packages" },
    { key: "footer.partnerTourismPackages", placeholder: true },
  ];

  const resourceLinks: FooterLinkItem[] = [
    { key: "footer.faq", href: "/faq" },
    { key: "footer.visaInformation", href: "/visa" },
    { key: "footer.patientGuide", href: "/pre-departure-guide.pdf", external: true, download: true },
    { key: "footer.patientStories", href: "/#testimonials" },
  ];

  const workWithUsLinks: FooterLinkItem[] = [
    { key: "footer.forHospitals", href: "/work-with-us#hospitals" },
    { key: "footer.forReferralPartners", href: "/work-with-us#referral-partners" },
    { key: "footer.forTravelPartners", href: "/work-with-us#travel-services" },
  ];

  const renderFooterItem = (item: FooterLinkItem) => {
    if (item.placeholder) {
      return <span className="text-gray-400">{t(item.key)}</span>;
    }

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          download={item.download}
          className="text-gray-400 hover:text-mintGreen transition-colors"
        >
          {t(item.key)}
        </a>
      );
    }

    if (item.href.startsWith("/#")) {
      return (
        <Link
          to={item.href}
          onClick={(event) => {
            const handled = handleInternalScroll(item.href);
            if (handled) {
              event.preventDefault();
            }
          }}
          className="text-gray-400 hover:text-mintGreen transition-colors"
        >
          {t(item.key)}
        </Link>
      );
    }

    return (
      <Link
        to={item.href}
        onClick={(event) => {
          const url = new URL(item.href, window.location.origin);
          const currentPath = `${location.pathname}${location.search}`;
          const targetPath = `${url.pathname}${url.search}`;

          if (currentPath === targetPath) {
            const handled = handleInternalScroll(item.href);
            if (handled) {
              event.preventDefault();
            }
          }
        }}
        className="text-gray-400 hover:text-mintGreen transition-colors"
      >
        {t(item.key)}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-6" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.aboutUs')}</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.aboutDesc')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61583204472393" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/medorahealth?s=11" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/medical_tourism_china?igsh=MXZmbXVvaGEweTJodQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/moderahealth/about/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Packages Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.ourPackages')}</h3>
            <ul className="space-y-2">
              {packagesLinks.map((item) => (
                <li key={item.key}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              {resourceLinks.map((item) => (
                <li key={item.key}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Work With Us Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.workWithUs')}</h3>
            <ul className="space-y-2">
              {workWithUsLinks.map((item) => (
                <li key={item.key}>{renderFooterItem(item)}</li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.contactUs')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-mintGreen mr-2 mt-0.5" />
                <span className="text-gray-400">
                RM H2 4/F CENTURY IND CTR, 33-35 AU PUI WAN ST FOTAN SHA TIN, HONG KONG
                </span>
              </li>
              {showBangladeshContact && (
                <>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-mintGreen mr-2 mt-0.5" />
                    <span className="text-gray-400">
                      Address: Medora Health Bangladesh, The Glass House, 38 Gulshan Avenue, Dhaka-1212
                    </span>
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-5 w-5 text-mintGreen mr-2" />
                    <a href="tel:+8801886420725" className="text-gray-400 hover:text-mintGreen transition-colors">
                      Contact: +880 1886 420 725
                    </a>
                  </li>
                </>
              )}
              <li className="flex items-center">
                <svg className="h-5 w-5 text-mintGreen mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <a href="https://wa.me/message/2K6XV4HKQ5DQN1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                  +1 470 861 3825
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-mintGreen mr-2" />
                <a href="mailto:contact@medicaltourismchina.health" className="text-gray-400 hover:text-mintGreen transition-colors">
                  contact@medicaltourismchina.health
                </a>
              </li>
              <li className="flex items-center">
                <Star className="h-5 w-5 text-mintGreen mr-2" />
                <a href={trustpilotProfileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mintGreen transition-colors">
                  Medora Health on Trustpilot
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 text-sm hover:text-mintGreen transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="text-gray-500 text-sm hover:text-mintGreen transition-colors">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="text-gray-500 text-sm hover:text-mintGreen transition-colors">
                {t('footer.cookiePolicy')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
