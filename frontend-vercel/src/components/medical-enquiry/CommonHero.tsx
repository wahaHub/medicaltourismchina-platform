

// Next Image removed;

interface CommonHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function CommonHero({
  title,
  subtitle,
  backgroundImage,
  gradientFrom = "#14B8A6",
  gradientTo = "#0D9488",
}: CommonHeroProps) {
  return (
    <div className="relative overflow-visible mt-[112px] sm:mt-[120px]">
      {/* Background Image - Responsive Height: Mobile/Tablet fixed, Desktop original */}
      <div className="relative h-[280px] sm:h-[350px] md:h-[420px] lg:h-[calc(100vh-400px)] lg:min-h-[400px]">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `linear-gradient(90deg, ${gradientFrom}E6 0%, ${gradientTo}E6 100%)`,
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div className="max-w-2xl text-white">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 sm:mb-3 md:mb-4">
                {title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed opacity-95">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
