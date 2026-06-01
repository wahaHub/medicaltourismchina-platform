import React from 'react';

interface ProcedureHeroStatsAlternativeProps {
  procedureName: string;
  waitingTime?: string;
  costRange?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
}

/**
 * Alternative implementation of ProcedureHeroStats with different visual styles.
 * This version offers multiple variants and enhanced visual effects.
 */
const ProcedureHeroStatsAlternative: React.FC<ProcedureHeroStatsAlternativeProps> = ({
  procedureName,
  waitingTime = '3-5 days',
  costRange = '$2000-$8000',
  className = '',
  variant = 'default',
}) => {
  // Determine padding and text sizes based on variant
  const getPaddingClasses = () => {
    switch (variant) {
      case 'compact':
        return 'px-6 py-4 md:px-8 md:py-6';
      case 'expanded':
        return 'px-10 py-10 md:px-16 md:py-12';
      default:
        return 'px-8 py-8 md:px-12 md:py-10';
    }
  };

  const getTextSizeClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          title: 'text-lg md:text-xl lg:text-2xl',
          value: 'text-xl md:text-2xl',
          label: 'text-xs',
        };
      case 'expanded':
        return {
          title: 'text-2xl md:text-3xl lg:text-4xl',
          value: 'text-3xl md:text-4xl',
          label: 'text-base',
        };
      default:
        return {
          title: 'text-xl md:text-2xl lg:text-3xl',
          value: 'text-2xl md:text-3xl',
          label: 'text-sm',
        };
    }
  };

  const textSizes = getTextSizeClasses();

  return (
    <div className={`relative ${className}`}>
      {/* Main container with pill shape */}
      <div 
        className="relative overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl"
        style={{
          borderRadius: variant === 'compact' ? '40px' : '9999px',
          minHeight: variant === 'compact' ? '100px' : variant === 'expanded' ? '150px' : '120px',
        }}
      >
        {/* Halfmoon background with parallax effect */}
        <div 
          className="absolute inset-0 z-0 transform transition-transform duration-500 hover:scale-105"
          style={{
            backgroundImage: 'url(/halfmoon.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Gradient overlay with enhanced glass effect */}
        <div 
          className="absolute inset-0 z-5"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(30, 40, 50, 0.7) 0%, rgba(20, 30, 40, 0.85) 50%),
              linear-gradient(135deg, rgba(20, 30, 40, 0.75) 0%, rgba(30, 40, 50, 0.85) 100%)
            `,
            backdropFilter: 'blur(3px) saturate(1.2)',
          }}
        />
        
        {/* Animated gradient accent (optional) */}
        <div 
          className="absolute inset-0 z-6 opacity-20"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'shimmer 3s infinite',
          }}
        />
        
        {/* Content container */}
        <div className={`relative z-10 ${getPaddingClasses()}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            
            {/* Section 1: Procedure Name */}
            <div className="flex-1 text-center md:text-left group">
              <h1 className={`${textSizes.title} font-bold text-white mb-1 transition-all duration-300 group-hover:text-blue-100`}>
                {procedureName}
              </h1>
              <p className={`text-gray-200 ${textSizes.label} font-medium uppercase tracking-wider opacity-90`}>
                Cost in China
              </p>
            </div>
            
            {/* Vertical Divider with gradient */}
            <div 
              className="hidden md:block w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-20"
              style={{ 
                height: variant === 'compact' ? '40px' : variant === 'expanded' ? '60px' : '50px',
              }}
            />
            
            {/* Section 2: Waiting Time */}
            <div className="flex-1 text-center group">
              <p className={`text-gray-200 ${textSizes.label} mb-2 font-medium uppercase tracking-wider opacity-90`}>
                Approx. Waiting Time in China
              </p>
              <p className={`${textSizes.value} font-bold text-white transition-all duration-300 group-hover:text-blue-100`}>
                {waitingTime}
              </p>
            </div>
            
            {/* Vertical Divider with gradient */}
            <div 
              className="hidden md:block w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-20"
              style={{ 
                height: variant === 'compact' ? '40px' : variant === 'expanded' ? '60px' : '50px',
              }}
            />
            
            {/* Section 3: Cost */}
            <div className="flex-1 text-center md:text-right group">
              <p className={`text-gray-200 ${textSizes.label} mb-2 font-medium uppercase tracking-wider opacity-90`}>
                Approx. Cost in China
              </p>
              <p className={`${textSizes.value} font-bold text-white transition-all duration-300 group-hover:text-blue-100`}>
                {costRange}
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default ProcedureHeroStatsAlternative;