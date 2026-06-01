# Airport Pick-up Components

Modular components for the Airport Pick-up service page with direct color values (no design-tokens dependency).

## Component Structure

```
airport-pickup/
├── HeroSection.tsx                # Hero banner with service overview
├── ServiceDetailsSection.tsx      # Door-to-door service details
├── VehicleOptionsSection.tsx      # Vehicle type options
├── ServiceGuaranteeSection.tsx    # Service guarantees
└── index.ts                       # Barrel export file
```

## Components

### HeroSection
Hero banner with gradient overlay introducing airport pick-up services.
- Teal gradient background (#14B8A6 to #0D9488)
- "Airport Pick-up" heading
- Chinese description of services
- Responsive height: 400px (mobile) → 500px (desktop)

### ServiceDetailsSection
Door-to-door service details with two-column layout.
- **Heading:** "端到端服务：精准对接，消除接驳车烦恼"
- 2-column grid with gray background cards
- **门到门接送服务 (1:1):**
  - Professional driver waiting at airport
  - Name sign pickup
  - Luggage assistance
  - Direct delivery to hospital/hotel
  - Bilingual communication
  
- **实时飞行跟踪与灵活调整:**
  - Real-time flight tracking
  - Automatic schedule adjustment for delays
  - No extra waiting fees
  - 24/7 customer support

### VehicleOptionsSection
Three vehicle type options with images.
- **Heading:** "车型选择"
- 3-column grid with vehicle cards
- **Vehicle Types:**
  - 三厢车 (Sedan) - 1-3 passengers
  - 七座车 (SUV) - 4-6 passengers
  - 九座车 (Van) - 8-9 passengers

### ServiceGuaranteeSection
Service guarantees with alternating layout.
- **Heading:** "服务承诺与优势"
- Alternating left/right image layout
- **Services:**
  - 呼叫即来 (On-demand booking)
  - 透明定价 (Transparent pricing)
  - 24小时响应 (24/7 response)

## Usage

```tsx
import {
  HeroSection,
  ServiceDetailsSection,
  VehicleOptionsSection,
  ServiceGuaranteeSection,
} from '@/components/airport-pickup';

export default function Page() {
  return (
    <>
      <HeroSection />
      <ServiceDetailsSection />
      <VehicleOptionsSection />
      <ServiceGuaranteeSection />
    </>
  );
}
```

## Design System (Direct Colors)

### Colors Used
```css
/* Primary Teal */
#14B8A6  /* Main brand color, headings, icons */
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
- **H4 (Cards):** 20px-24px, font-bold
- **Body:** 16px-18px, font-normal
- **Line height:** 1.5-1.75 (relaxed)

### Spacing
- Section padding: py-20 (80px)
- Container: max-w-6xl (1152px)
- Grid gap: gap-8 (32px)
- Card padding: p-6 to p-8 (24px-32px)

### Component Patterns
- **Vehicle Cards:** 192px height images with object-contain
- **Image Cards:** 320px height, rounded-2xl, shadow-xl
- **Alternating Layout:** Flex-row with reverse for alternating placement
- **Gradients:** Teal gradient overlays on hero images

## Assets

All images in `/public/airport-pickup/`:
- `hero-banner.png` - Hero background (1761 x 490px)
- `pickup-icon.png` - Pickup icon (273 x 13px)
- `car-sedan.png` - Sedan vehicle (301 x 280px)
- `car-suv.png` - SUV vehicle (301 x 280px)
- `car-van.png` - Van vehicle (301 x 280px)
- `booking-service.png` - Booking service (1377 x 978px)
- `transparent-pricing.png` - Transparent pricing (1007 x 438px)
- `support-24-7.png` - 24/7 support (1007 x 438px)

## Responsive Design

### Mobile (< 768px)
- Single column layouts
- Stacked content
- Reduced padding and font sizes
- 400px hero height

### Tablet (768px - 1024px)
- 2-column grids for services
- 3-column for vehicles
- Medium padding
- Standard font sizes

### Desktop (> 1024px)
- 2-3 column grids
- Full padding
- Large font sizes
- 500px hero height

## Content Language

This page is primarily in Chinese:
- Hero description in Chinese
- All service descriptions in Chinese
- Vehicle descriptions in Chinese
- Feature titles in Chinese
- Metadata and alt texts in English

## Vehicle Options

### 三厢车 (Sedan)
- Capacity: 1-3 passengers
- Luggage: 2-3 standard suitcases
- Features: Air conditioning, audio system
- Best for: Business travel, individual patients

### 七座车 (SUV)
- Capacity: 4-6 passengers
- Luggage: 4-6 large suitcases
- Features: Spacious seating, large trunk
- Best for: Families, patients with medical equipment

### 九座车 (Van)
- Capacity: 8-9 passengers
- Luggage: Multiple large suitcases
- Features: Independent AC, maximum space
- Best for: Large groups, medical teams

## Key Features

✅ **No design-tokens dependency** - All colors are direct values
✅ **Modular architecture** - Self-contained components
✅ **Chinese content** - Native language descriptions
✅ **Pixel-perfect design** - Matches Figma screenshot
✅ **Responsive layouts** - Mobile-first approach
✅ **Optimized images** - Next.js Image component
✅ **Multiple vehicle options** - Sedan, SUV, Van
✅ **Real-time tracking** - Flight monitoring system
✅ **24/7 availability** - Round-the-clock service
✅ **Transparent pricing** - No hidden fees
