// Next Image removed;

interface IconFeatureCardProps {
  icon?: string;
  title: string;
  description: string | string[];
  circleSize?: {
    base?: string;
    sm?: string;
    md?: string;
  };
  iconSize?: {
    base?: string;
    sm?: string;
    md?: string;
  };
  titleSize?: string;
  descriptionSize?: string;
  showUnderline?: boolean;
}

export default function IconFeatureCard({ 
  icon, 
  title, 
  description,
  circleSize = {
    base: "w-24 h-24",
    sm: "sm:w-28 sm:h-28",
    md: "md:w-32 md:h-32"
  },
  iconSize = {
    base: "w-12 h-12",
    sm: "sm:w-14 sm:h-14",
    md: "md:w-16 md:h-16"
  },
  titleSize = "text-base sm:text-lg md:text-xl lg:text-2xl",
  descriptionSize = "text-xs",
  showUnderline = true,
}: IconFeatureCardProps) {
  const circleClasses = `${circleSize.base} ${circleSize.sm} ${circleSize.md}`;
  const iconClasses = `${iconSize.base} ${iconSize.sm} ${iconSize.md}`;

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon Circle - Only show if icon is provided */}
      {icon && (
        <div className={`${circleClasses} rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F638E] flex items-center justify-center mb-4 sm:mb-5 md:mb-6`}>
          <div className={`relative ${iconClasses}`}>
            <img
              src={icon}
              alt={title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Title with Optional Underline */}
      <div className="mb-3 sm:mb-4">
        <h3 className={`${titleSize} font-bold text-[#003B59] mb-2`}>
          {title}
        </h3>
        {showUnderline && (
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#14B8A6] to-[#0F638E] mx-auto rounded-full"></div>
        )}
      </div>

      {/* Description - Support both string and array */}
      {Array.isArray(description) ? (
        <ul className={`${descriptionSize} text-gray-600 leading-relaxed max-w-2xl text-left space-y-3`}>
          {description.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-[#14B8A6] mr-3 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${descriptionSize} text-gray-600 leading-relaxed max-w-2xl`}>
          {description}
        </p>
      )}
    </div>
  );
}
