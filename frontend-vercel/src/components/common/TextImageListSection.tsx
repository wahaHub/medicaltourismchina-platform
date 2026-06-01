/**
 * TextImageListSection Component
 * 
 * A highly reusable component for displaying content with card-based layout and gradient overlays.
 * Perfect for showcasing features, benefits, values, or any list-based content with images.
 * 
 * Features:
 * - Card-based design with gradient overlay on images
 * - Fully responsive design
 * - Customizable title, subtitle, items, and styling
 * - Pixel-perfect design matching Figma specifications
 * - Flexible background colors and spacing
 * 
 * @example
 * // Basic usage
 * <TextImageListSection
 *   title="Our Features"
 *   items={[
 *     {
 *       title: "Feature 1",
 *       description: "Description here...",
 *       image: "/images/feature1.jpg",
 *       imageAlt: "Feature 1"
 *     }
 *   ]}
 * />
 * 
 * @example
 * // With subtitle and custom background
 * <TextImageListSection
 *   title="Core Values"
 *   subtitle="What drives us"
 *   items={items}
 *   backgroundColor="bg-gray-50"
 * />
 */

// Next Image removed

export interface TextImageItem {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface TextImageListSectionProps {
  title: string;
  subtitle?: string;
  items: TextImageItem[];
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  cardBackgroundColor?: string;
}

export default function TextImageListSection({
  title,
  subtitle,
  items,
  backgroundColor = 'bg-white',
  titleColor = 'text-[#14B8A6]',
  descriptionColor = 'text-gray-600',
  cardBackgroundColor = 'bg-[#e4e4e4ff]',
}: TextImageListSectionProps) {
  return (
    <section className={`py-16 md:py-20 lg:py-24 ${backgroundColor}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${titleColor} leading-tight`}
          >
            {title}
          </h2>
          {subtitle && (
            <h3
              className={`text-2xl sm:text-3xl md:text-4xl font-bold ${titleColor} leading-tight`}
            >
              {subtitle}
            </h3>
          )}
        </div>

        {/* Items */}
        <div className="space-y-3 sm:space-y-3 md:space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl ${cardBackgroundColor} overflow-hidden shadow-sm`}
            >
              <div className="grid md:grid-cols-2 gap-0 items-center">
                {/* Text Content */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                  <h3
                    className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold ${titleColor} mb-2`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-xs md:text-sm ${descriptionColor} leading-relaxed`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Image */}
                <div className="relative h-[200px] sm:h-[200px] md:h-[280px] md:min-h-[240px]">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(270deg, rgba(244, 245, 246, 0) 52.79%, #e4e4e4ff 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
