interface PackageStepCardProps {
  stepNumber: number;
  title: string;
  content: string[];
  image?: string;
  imagePosition?: 'left' | 'right';
  className?: string;
  hideImage?: boolean;
}

const PackageStepCard = ({ 
  stepNumber, 
  title, 
  content, 
  image, 
  imagePosition = 'left',
  className = '',
  hideImage = false,
}: PackageStepCardProps) => {
  const contentSection = (
    <div className="flex-1 bg-gray-100/90 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:bg-gray-100 group">
      <div className="flex gap-4 mb-6">
        <div className="text-[3.5rem] font-bold leading-none text-gray-800/90 transition-transform duration-300 group-hover:scale-105">{String(stepNumber).padStart(2, '0')}</div>
        <h3 className="text-[1.35rem] font-bold text-gray-800/90 leading-tight max-w-[15ch] mt-1 transition-colors duration-300 group-hover:text-primaryGreen">{title}</h3>
      </div>
      <ul className="space-y-3">
        {content.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-1 h-1 rounded-full bg-primaryGreen mt-1.5 flex-shrink-0 transition-all duration-300 group-hover:scale-150 group-hover:bg-primaryGreen/80"></div>
            <p className="text-gray-600/90 text-xs leading-relaxed tracking-wide transition-transform duration-300 group-hover:translate-x-1">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const spacerSection = (
    <div className="flex-1">
      {!hideImage && (
        <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden">
          <img
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`
        flex flex-col md:flex-row gap-8 items-center max-w-[85%] mx-auto scale-85 
        ${imagePosition === 'right' ? 'md:flex-row-reverse md:-translate-x-[30px]' : 'md:translate-x-[30px]'}
        ${className}
        animate-fade-in hover:scale-[0.87] transition-transform duration-300
      `}
    >
      {spacerSection}
      {contentSection}
    </div>
  );
};

export default PackageStepCard; 