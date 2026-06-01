# Hotel Accommodation Components

Modular components for the Hotel Accommodation service page with direct color values (no design-tokens dependency).

## Component Structure

```
hotel-accommodation/
├── HeroSection.tsx                # Hero banner with service overview
├── SelectionCriteriaSection.tsx   # Hotel selection criteria
├── HotelGallerySection.tsx        # Hotel image gallery with categories
├── ServiceAdvantagesSection.tsx   # Service advantages
└── index.ts                       # Barrel export file
```

## Components

### HeroSection
Hero banner with gradient overlay introducing hotel accommodation services.
- Teal gradient background (#14B8A6 to #0D9488)
- "Hotel Accommodation" heading
- Chinese description of services
- Responsive height: 400px (mobile) → 500px (desktop)

### SelectionCriteriaSection
Hotel selection criteria with two-column layout.
- **Heading:** "选址标准：近离医院 + 便捷配套 + 适少环境优质"
- 2-column grid with gray background cards
- **小时距离之内 (1:1):**
  - Walking distance to hospital
  - Reduced travel time
  - Emergency access
  - Complete facilities
  - Convenient transportation
  
- **大型综合三甲医院对接:**
  - Partnership with top hospitals
  - Staff familiar with hospital procedures
  - Appointment assistance
  - Medical-related services
  - Patient-specific support

### HotelGallerySection
Hotel image gallery with category tabs.
- **Heading:** "房型展示"
- Category tabs: 酒店外观, 客房环境, 配套设施
- 4-column grid (2 columns on mobile)
- 8 hotel images showcasing different areas

### ServiceAdvantagesSection
Service advantages with alternating layout.
- **Heading:** "服务优势：安全、英语、各语种"
- Alternating left/right image layout
- **Services:**
  - 安全保障 (Safety and security)
  - 清洁卫生 (Cleanliness and hygiene)
  - 性价比优质 (Excellent value)

## Usage

```tsx
import {
  HeroSection,
  SelectionCriteriaSection,
  HotelGallerySection,
  ServiceAdvantagesSection,
} from '@/components/hotel-accommodation';

export default function Page() {
  return (
    <>
      <HeroSection />
      <SelectionCriteriaSection />
      <HotelGallerySection />
      <ServiceAdvantagesSection />
    </>
  );
}
```

## Design System (Direct Colors)

### Colors Used
```css
/* Primary Teal */
#14B8A6  /* Main brand color, headings, buttons */
#0D9488  /* Gradient end, hover states */

/* Gray Scale */
#1f2937  /* Dark text (gray-800) */
#4b5563  /* Medium text (gray-600) */
#f9fafb  /* Light background (gray-50) */
#f3f4f6  /* Card background (gray-100) */
#ffffff  /* White backgrounds */
```

### Typography
- **H1 (Hero):** 48px-60px, font-bold
- **H2 (Sections):** 36px-48px, font-bold
- **H3 (Subsections):** 24px-30px, font-bold
- **Body:** 16px-18px, font-normal
- **Line height:** 1.5-1.75 (relaxed)

### Spacing
- Section padding: py-20 (80px)
- Container: max-w-6xl to max-w-7xl (1152px-1280px)
- Grid gap: gap-4 to gap-12 (16px-48px)
- Card padding: p-8 (32px)

### Component Patterns
- **Gallery Images:** 192px height, rounded-xl, shadow-lg
- **Service Images:** 320px height, rounded-2xl, shadow-xl
- **Category Tabs:** Rounded-full buttons with teal background
- **Alternating Layout:** Flex-row with reverse for alternating placement

## Assets

All images in `/public/hotel-accommodation/`:
- `hero-banner.png` - Hero background
- `hotel-icon.png` - Hotel icon
- `hotel-exterior.png` - Hotel exterior view
- `hotel-gym.png` - Hotel gym facility
- `hotel-room.png` - Hotel room
- `hotel-dining.png` - Hotel dining area
- `hotel-lobby.png` - Hotel lobby
- `hotel-restaurant.png` - Hotel restaurant
- `hotel-bathroom.png` - Hotel bathroom
- `hotel-entrance.png` - Hotel entrance
- `safety-security.png` - Safety and security
- `cleanliness.png` - Cleanliness standards
- `value-pricing.png` - Value pricing

## Responsive Design

### Mobile (< 768px)
- Single column layouts
- 2-column gallery grid
- Stacked content
- Reduced padding and font sizes
- 400px hero height

### Tablet (768px - 1024px)
- 2-column grids for criteria
- 4-column gallery grid
- Medium padding
- Standard font sizes

### Desktop (> 1024px)
- 2-column grids maintained
- 4-column gallery grid
- Full padding
- Large font sizes
- 500px hero height

## Content Language

This page is primarily in Chinese:
- Hero description in Chinese
- All service descriptions in Chinese
- Category labels in Chinese
- Feature titles in Chinese
- Metadata and alt texts in English

## Hotel Categories

### 酒店外观 (Hotel Exterior)
- Exterior views
- Entrance areas
- Lobby spaces

### 客房环境 (Room Environment)
- Guest rooms
- Bathrooms
- Room amenities

### 配套设施 (Facilities)
- Gym and fitness
- Dining areas
- Restaurants
- Common areas

## Key Features

✅ **No design-tokens dependency** - All colors are direct values
✅ **Modular architecture** - Self-contained components
✅ **Chinese content** - Native language descriptions
✅ **Pixel-perfect design** - Matches Figma screenshot
✅ **Responsive layouts** - Mobile-first approach
✅ **Optimized images** - Next.js Image component
✅ **Image gallery** - 8 hotel photos with categories
✅ **Category tabs** - Interactive hotel type filtering
✅ **Safety emphasis** - Security and cleanliness highlighted
✅ **Value pricing** - Transparent pricing information
