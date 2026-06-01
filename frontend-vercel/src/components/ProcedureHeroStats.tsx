import React from 'react';

interface ProcedureHeroStatsProps {
  procedureName: string;
  waitingTime?: string;
  costRange?: string;
  className?: string;
}

/**
 * A reusable component that displays procedure statistics overlaid on a halfmoon background.
 * Features a pill-shaped design with three information sections arranged horizontally on desktop
 * and vertically on mobile.
 */
const ProcedureHeroStats: React.FC<ProcedureHeroStatsProps> = ({
  procedureName,
  waitingTime = '3-5 days',
  costRange = '$2000-$8000',
  className = '',
}) => {
  return (
    <div 
      className={`relative overflow-hidden shadow-2xl ${className}`}
      style={{
        borderRadius: '9999px', // Full pill shape
        minHeight: '120px', // Ensure minimum height for content
      }}
    >
      {/* Halfmoon as full background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/halfmoon.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Semi-transparent overlay for better text readability */}
      <div 
        className="absolute inset-0 z-5"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 30, 40, 0.75) 0%, rgba(30, 40, 50, 0.85) 100%)',
          backdropFilter: 'blur(2px)',
        }}
      />
      
      {/* Three sections container - positioned over halfmoon */}
      <div className="relative z-10 px-8 py-8 md:px-12 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          
          {/* Section 1: Procedure Name */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
              {procedureName}
            </h1>
            <p className="text-gray-200 text-sm font-medium">Cost in China</p>
          </div>
          
          {/* Vertical Divider (hidden on mobile) */}
          <div 
            className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-40"
            style={{ height: '50px' }}
          />
          
          {/* Section 2: Waiting Time */}
          <div className="flex-1 text-center">
            <p className="text-gray-200 text-sm mb-2 font-medium">Approx. Waiting Time in China</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {waitingTime}
            </p>
          </div>
          
          {/* Vertical Divider (hidden on mobile) */}
          <div 
            className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-40"
            style={{ height: '50px' }}
          />
          
          {/* Section 3: Cost */}
          <div className="flex-1 text-center md:text-right">
            <p className="text-gray-200 text-sm mb-2 font-medium">Approx. Cost in China</p>
            <p className="text-2xl md:text-3xl font-bold text-white">
              {costRange}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProcedureHeroStats;