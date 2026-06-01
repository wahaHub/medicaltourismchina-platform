# Medical Enquiry Components

Modular components for the Medical Enquiry consultation service page.

## Components

### HeroSection
Hero banner with gradient overlay and introductory text.
- Teal gradient background
- Overlay image effect
- Responsive typography

### TreatmentPlanSection
Detailed treatment planning features section.
- 3-column grid layout
- Circular teal icons
- Multi-stage planning, customized consultation, and intelligence plan features

### CostEstimationSection
Transparent pricing and cost breakdown information.
- 3-column card grid
- Light gray background cards with hover effects
- Categorization, standards, and proactive support services

### CoreValueSection
Core consultation values with alternating image layout.
- Side-by-side content and images
- Alternating left/right layout
- Three key values: avoid blind spots, compare options, seamless care

## Usage

```tsx
import {
  HeroSection,
  TreatmentPlanSection,
  CostEstimationSection,
  CoreValueSection,
} from '@/components/medical-enquiry';

export default function MedicalEnquiryPage() {
  return (
    <>
      <HeroSection />
      <TreatmentPlanSection />
      <CostEstimationSection />
      <CoreValueSection />
    </>
  );
}
```

## Design Principles

1. **Modular Architecture** - Each section is self-contained
2. **Consistent Styling** - Teal (#14B8A6) as primary color
3. **Responsive Design** - Mobile-first approach
4. **Accessibility** - Semantic HTML and proper alt texts
5. **Performance** - Optimized images with Next.js Image component

## Color Palette

- Primary: `#14B8A6` (Teal)
- Hover: `#0D9488` (Dark Teal)
- Text: `#374151`, `#4b5563` (Gray)
- Background: `#f9fafb`, `#f3f4f6` (Light Gray)
