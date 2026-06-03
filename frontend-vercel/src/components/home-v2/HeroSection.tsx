import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { HomepageJourneyEntry } from "@/components/SearchBar";

const PUBLIC_MEDIA_BASE = (import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '');
const LOW_MEDIA_BASE = `${PUBLIC_MEDIA_BASE}/low`;
const HERO_POSTER_URL = `${LOW_MEDIA_BASE}/figma-assets/hero-bg_x2.png`;
const HERO_VIDEO_URL = import.meta.env.VITE_HOMEPAGE_HERO_VIDEO_URL || `${PUBLIC_MEDIA_BASE}/videos/front.mp4`;

export default function HeroSection() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    // Ensure video plays after component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video autoplay failed:', err);
      });
    }
  }, []);

  return (
    <section className="relative pt-0 mt-[112px] sm:mt-[120px] mb-0 lg:mb-20">
      {/* Background Video with Overlay - Responsive on mobile/tablet, original on desktop */}
      <div className="absolute inset-0 min-h-[320px] sm:min-h-[380px] md:min-h-[450px] lg:h-auto lg:min-h-[480px] overflow-hidden bg-gray-100">
        <img
          src={HERO_POSTER_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={HERO_POSTER_URL}
          className={`absolute inset-0 w-full h-full object-cover ${videoFailed ? 'hidden' : ''}`}
          onError={(e) => {
            console.error('Video loading error:', e);
            setVideoFailed(true);
          }}
          onLoadedData={() => {
            setVideoFailed(false);
            console.log('Video loaded successfully');
          }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
          {/* Fallback image for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-white/60 sm:bg-white/50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 py-8 sm:py-12 lg:py-16 min-h-[320px] sm:min-h-[380px] md:min-h-[450px] lg:min-h-[480px]">
        <div className="h-full flex items-center">
          <div className="w-full lg:max-w-5xl text-center lg:text-left pt-4 sm:pt-8 lg:pt-8 pb-16 lg:pb-24">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A4A5C] leading-tight uppercase mb-3 sm:mb-4">
              {t('hero.mainTitle') || 'Medical comprehensive services'}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-[#0A4A5C]/80 mb-4 sm:mb-5 lg:mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.mainSubtitle') || 'Resolve currency exchange, hotel booking, catering booking, ticketing booking, tourism reception, airport tax refund, medical customer acquisition, etc'}
            </p>
            <div className="mx-auto mt-6 max-w-5xl lg:mx-0">
              <HomepageJourneyEntry variant="hero" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - positioned at bottom to overlap with hero image - Desktop only */}
      <div className="absolute -bottom-16 left-0 right-0 z-20 hidden lg:block" style={{ minHeight: '112px' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-4 gap-4 xl:gap-6">
            <Link to="/search">
              <Card className="bg-white backdrop-blur-sm p-4 xl:p-6 flex flex-col items-center justify-center text-center border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow cursor-pointer h-full min-h-[112px]">
                <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-1 xl:mb-2">
                  600 +
                </div>
                <div className="text-[10px] xl:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {t('homepage.stats.commonDiseases') || 'Common Diseases'}
                </div>
              </Card>
            </Link>

            <Link to="/search">
              <Card className="bg-white backdrop-blur-sm p-4 xl:p-6 flex flex-col items-center justify-center text-center border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow cursor-pointer h-full min-h-[112px]">
                <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-1 xl:mb-2">
                  1600 +
                </div>
                <div className="text-[10px] xl:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {t('homepage.stats.commonSurgeries') || 'Common Surgeries'}
                </div>
              </Card>
            </Link>

            <Link to="/hospitals">
              <Card className="bg-white backdrop-blur-sm p-4 xl:p-6 flex flex-col items-center justify-center text-center border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow cursor-pointer h-full min-h-[112px]">
                <div className="text-3xl xl:text-4xl 2xl:text-5xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-1 xl:mb-2">
                  200 +
                </div>
                <div className="text-[10px] xl:text-xs font-semibold text-gray-600 uppercase tracking-wide leading-tight">
                  {t('homepage.stats.chineseHospitals') || 'Chinese Cooperative Hospitals'}
                </div>
              </Card>
            </Link>

            <Link to="/free-quote">
              <Card className="relative overflow-hidden p-4 xl:p-6 flex flex-col items-start justify-center border-0 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow cursor-pointer h-full min-h-[112px]">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${LOW_MEDIA_BASE}/root_assets/customize_bg_hero_x2.png')`,
                  }}
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, #1DA78A 0%, #0F638E 100%)',
                    opacity: 0.9
                  }}
                />
                <div className="relative z-10 text-left">
                  <div className="text-base xl:text-lg 2xl:text-xl font-semibold mb-2 xl:mb-3 leading-tight">
                    {t('homepage.hero.customizePlan')}
                  </div>
                  <Button className="text-white shadow-none cursor-pointer text-left p-0 bg-transparent hover:bg-transparent rounded-full text-xs xl:text-sm font-semibold transition-all">
                    {t('homepage.hero.letsGoNow')}
                    <img src={`${LOW_MEDIA_BASE}/root_assets/right_arrow_icon_x2.png`} alt="Arrow" className="ml-2 w-4 h-4 inline" />
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Stats Cards - Separate section below hero */}
      <div className="lg:hidden relative bg-white pt-6 sm:pt-8 pb-0">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link to="/search">
              <Card className="bg-white backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow min-h-[120px] sm:min-h-[140px]">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-2">
                  600 +
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase leading-tight">
                  {t('homepage.stats.commonDiseases') || 'Common Diseases'}
                </div>
              </Card>
            </Link>

            <Link to="/search">
              <Card className="bg-white backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow min-h-[120px] sm:min-h-[140px]">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-2">
                  1600 +
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase leading-tight">
                  {t('homepage.stats.commonSurgeries') || 'Common Surgeries'}
                </div>
              </Card>
            </Link>

            <Link to="/hospitals">
              <Card className="bg-white backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center justify-center text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow min-h-[120px] sm:min-h-[140px]">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent mb-2">
                  200 +
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase leading-tight">
                  {t('homepage.stats.chineseHospitals') || 'Chinese Hospitals'}
                </div>
              </Card>
            </Link>

            <Link to="/free-quote">
              <Card className="relative overflow-hidden p-4 sm:p-6 flex flex-col items-start justify-center border-0 rounded-xl text-white shadow-lg min-h-[120px] sm:min-h-[140px] hover:shadow-xl transition-shadow">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${LOW_MEDIA_BASE}/root_assets/customize_bg_hero_x2.png')`,
                  }}
                />
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, #1DA78A 0%, #0F638E 100%)',
                    opacity: 0.9
                  }}
                />
                <div className="relative z-10 text-left w-full">
                  <div className="text-[10px] sm:text-xs font-semibold mb-2 sm:mb-3 leading-tight">
                    {t('homepage.hero.customizePlan')}
                  </div>
                  <Button className="text-white bg-white/20 hover:bg-white/30 border border-white/50 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-semibold h-auto inline-flex items-center gap-1">
                    {t('homepage.hero.letsGoNow')}
                    <img src={`${LOW_MEDIA_BASE}/root_assets/right_arrow_icon_x2.png`} alt="Arrow" className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
