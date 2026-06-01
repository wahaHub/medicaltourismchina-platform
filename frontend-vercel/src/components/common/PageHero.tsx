

// Next Image removed;

interface PageHeroProps {
  title: string | React.ReactNode;
  subtitle: string;
  backgroundImage: string;
  gradientOverlay?: string;
  className?: string;
  textColor?: 'dark' | 'light';
  heightClassName?: string;
  imageObjectPosition?: string;
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  gradientOverlay = "linear-gradient(90deg, rgba(255, 255, 255, 0.81) 0%, rgba(255, 255, 255, 0) 100%)",
  className = '',
  textColor = 'dark',
  heightClassName = "h-[280px] sm:h-[350px] md:h-[420px] lg:h-[400px] xl:h-[500px] 2xl:h-[705px]",
  imageObjectPosition = "center center",
}: PageHeroProps) {
  return (
    <div className={`relative overflow-visible mt-[112px] sm:mt-[120px] ${className}`}>
      {/* Background Image - Responsive Height: Mobile/Tablet fixed, Desktop original */}
      <div className={`relative overflow-hidden ${heightClassName}`}>
        <img
          src={backgroundImage}
          alt={typeof title === 'string' ? title : 'Hero Banner'}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: imageObjectPosition }}
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            background: gradientOverlay
          }}
        />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4">
                {/* from-[#003B59] to-[#038A81] */}
                {typeof title === 'string' ? (
                  <span 
                    className={textColor === 'light' ? 'text-white' : 'text-[#003B59]'}
                  >
                    {title}
                  </span>
                ) : (
                  title
                )}
              </h1>
              <p className={`text-xs sm:text-sm lg:text-base leading-relaxed ${textColor === 'light' ? 'text-white/95' : 'text-gray-700'}`}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
