import { ReactNode } from 'react';
// Next Image removed

interface IconFeature {
  icon: ReactNode | string;
  title: string;
  description: string;
}

interface IconFeatureSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  features: IconFeature[];
  backgroundColor?: string;
  iconColor?: string;
  titleColor?: string;
  titleBackground?: string;
}

export default function IconFeatureSection({
  title,
  subtitle,
  description,
  features,
  backgroundColor = 'bg-white',
  iconColor = 'text-[#14B8A6]',
  titleColor = 'text-[#14B8A6]',
  titleBackground = 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)'
}: IconFeatureSectionProps) {
  return (
    <section className={`py-12 sm:py-16 md:py-20 ${backgroundColor}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2 
            className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <h3 
              className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6"
              style={{
                background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm md:text-sm max-w-4xl mx-auto leading-relaxed px-4">
              {description}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center bg-white rounded-2xl p-8 sm:p-9 md:p-10 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-6 sm:mb-7 md:mb-8">
                {typeof feature.icon === 'string' ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F638E] flex items-center justify-center">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={iconColor}>{feature.icon}</div>
                )}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5">
                {feature.title}
              </h4>
              {feature.description.match(/^\d+\)/) ? (
                <div className="text-[12px] text-gray-600 leading-relaxed text-left space-y-3">
                  {feature.description.split(/(?=\d+\))/).filter(Boolean).map((item, idx) => (
                    <p key={idx} className='p-0 m-0'>
                      {item.trim()}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-600 leading-relaxed text-center">
                  {feature.description}
                </p>
              )}
            
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
