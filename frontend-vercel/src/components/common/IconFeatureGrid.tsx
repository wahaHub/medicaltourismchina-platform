import IconFeatureCard from "./IconFeatureCard";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface IconFeatureGridProps {
  items: FeatureItem[];
}

export default function IconFeatureGrid({ items }: IconFeatureGridProps) {
  // Determine grid columns based on number of items
  const getGridCols = () => {
    const count = items.length;
    
    // For 1-2 items: 1 column on mobile, 2 on desktop
    if (count <= 2) {
      return "grid-cols-1 md:grid-cols-2";
    }
    
    // For 3 items: 1 column on mobile, 3 on desktop
    if (count === 3) {
      return "grid-cols-1 md:grid-cols-3";
    }
    
    // For 4 items: 1 column on mobile, 2 on tablet/desktop
    if (count === 4) {
      return "grid-cols-1 md:grid-cols-2";
    }
    
    // For 5+ items: 1 column on mobile, 2 on tablet, 3 on desktop
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div className={`grid ${getGridCols()} gap-4 sm:gap-3 md:gap-4 lg:gap-6`}>
      {items.map((item, index) => (
        <IconFeatureCard
          key={index}
          icon={item.icon}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>
  );
}
