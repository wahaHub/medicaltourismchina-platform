import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getImageUrl, IMAGE_PATHS } from '@/utils/imageUrl';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ProgressiveImage from '@/components/ProgressiveImage';

interface ServicesSectionProps {
  onQuoteRequest?: () => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onQuoteRequest }) => {
  const { t } = useLanguage();

  return (
    <div className="py-16" style={{background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)'}}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('procedureDetail.ourServiceProcess')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('procedureDetail.serviceProcessSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-4 md:gap-6">
            {/* Service Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-105">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg ring-2 md:ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                  <ProgressiveImage
                    baseUrl={getImageUrl(IMAGE_PATHS.serviceProcess.step1)}
                    alt="Choose Treatment"
                    resolutionLevels={['x1', 'x2']}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md border-2 border-white">
                  1
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-xs md:text-base leading-tight px-1">
                {t('procedureDetail.service1.title')}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 leading-relaxed px-1 hidden sm:block">
                {t('procedureDetail.service1.description')}
              </p>
            </div>

            {/* Service Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-105">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg ring-2 md:ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                  <ProgressiveImage
                    baseUrl={getImageUrl(IMAGE_PATHS.serviceProcess.step2)}
                    alt="Video Consultation"
                    resolutionLevels={['x1', 'x2']}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md border-2 border-white">
                  2
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-xs md:text-base leading-tight px-1">
                {t('procedureDetail.service2.title')}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 leading-relaxed px-1 hidden sm:block">
                {t('procedureDetail.service2.description')}
              </p>
            </div>

            {/* Service Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-105">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg ring-2 md:ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                  <ProgressiveImage
                    baseUrl={getImageUrl(IMAGE_PATHS.serviceProcess.step3)}
                    alt="Visa Assistance"
                    resolutionLevels={['x1', 'x2']}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md border-2 border-white">
                  3
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-xs md:text-base leading-tight px-1">
                {t('procedureDetail.service3.title')}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 leading-relaxed px-1 hidden sm:block">
                {t('procedureDetail.service3.description')}
              </p>
            </div>

            {/* Service Step 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="relative mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-105">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg ring-2 md:ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                  <ProgressiveImage
                    baseUrl={getImageUrl(IMAGE_PATHS.serviceProcess.step4)}
                    alt="Airport Transfer"
                    resolutionLevels={['x1', 'x2']}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md border-2 border-white">
                  4
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-xs md:text-base leading-tight px-1">
                {t('procedureDetail.service4.title')}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 leading-relaxed px-1 hidden sm:block">
                {t('procedureDetail.service4.description')}
              </p>
            </div>

            {/* Service Step 5 - Centered in last row on mobile */}
            <div className="flex flex-col items-center text-center group col-span-2 md:col-span-1">
              <div className="relative mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-105">
                <div className="w-24 h-24 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg ring-2 md:ring-4 ring-emerald-100 group-hover:ring-emerald-200 transition-all duration-300">
                  <ProgressiveImage
                    baseUrl={getImageUrl(IMAGE_PATHS.serviceProcess.step5)}
                    alt="Hospital Support"
                    resolutionLevels={['x1', 'x2']}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-8 h-8 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg shadow-md border-2 border-white">
                  5
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-xs md:text-base leading-tight px-1">
                {t('procedureDetail.service5.title')}
              </h3>
              <p className="text-[10px] md:text-sm text-gray-600 leading-relaxed px-1 hidden sm:block">
                {t('procedureDetail.service5.description')}
              </p>
            </div>
          </div>

          {/* Get A Quote Now Button */}
          {onQuoteRequest && (
            <div className="text-center mt-12">
              <Button
                onClick={onQuoteRequest}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                {t('quote.cta.button')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;