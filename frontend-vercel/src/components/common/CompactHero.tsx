

// Next Image removed;

interface CompactHeroProps {
  backgroundImage: string;
  overlayColor?: string;
  children: React.ReactNode;
}

export default function CompactHero({
  backgroundImage,
  overlayColor = "bg-[#14B8A6]/85",
  children,
}: CompactHeroProps) {
  return (
    <section className="relative mt-[112px] sm:mt-[120px] overflow-hidden w-full">
      {/* Background Image - Responsive: Mobile/Tablet fixed, Desktop original */}
      <div className="absolute inset-0 h-[280px] sm:h-[350px] md:h-[420px] lg:h-auto w-full" style={{ zIndex: 0 }}>
        <img
          src={backgroundImage}
          alt="Hero Background"
          className="h-full w-full object-cover"
        />
        {/* Overlay */}
        <div className={`absolute inset-0 ${overlayColor}`}></div>
      </div>

      {/* Content - Responsive: Mobile/Tablet fixed height, Desktop original padding */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl relative py-6 sm:py-12 md:py-16 lg:py-20 h-[215px] sm:h-[350px] md:h-[420px] lg:h-auto flex items-center w-full" style={{ zIndex: 10 }}>
        <div className="w-full max-w-full">
          {children}
        </div>
      </div>
    </section>
  );
}
