# Language Interpreter Components

Modular components for the Language Interpreter services page with direct color values (no design-tokens dependency).

## Component Structure

```
language-interpreter/
├── HeroSection.tsx                    # Hero banner with service overview
├── ComprehensiveServiceSection.tsx    # Two-stage interpretation services
├── QualityAssuranceSection.tsx        # Quality assurance features
├── LanguageSupportSection.tsx         # Language support services
└── index.ts                           # Barrel export file
```

## Components

### HeroSection
Hero banner with gradient overlay introducing language interpretation services.
- Teal gradient background (#14B8A6 to #0D9488)
- "Language Interpreter" heading
- Chinese description of services
- Responsive height: 400px (mobile) → 500px (desktop)

### ComprehensiveServiceSection
Two-stage comprehensive interpretation services.
- **Heading:** "周遍全诊疗场景与专业口译服务"
- 2-column grid with gray background cards
- **1st 初诊陪同口译 (Initial Consultation):**
  - First medical consultation accompaniment
  - Medical history translation
  - Diagnosis explanation
  - Examination procedure clarification
  - Treatment plan understanding
  
- **2nd 治疗过程口译 (Treatment Process):**
  - Pre-surgery explanation and consent
  - Medication guidance translation
  - Test results interpretation
  - Daily nursing communication
  - Emergency communication support

### QualityAssuranceSection
Quality assurance and professional standards.
- **Heading:** "提质保障：医疗专业 + 语言双认证，精确沟通无障碍"
- 3-column grid with large circular icons
- **Features:**
  - 资深专业口译 (Senior professional interpreters)
  - 多语言覆盖 (Multilingual coverage - 20+ languages)
  - 严格保密 (Strict confidentiality)

### LanguageSupportSection
Language support services with alternating layout.
- **Heading:** "语言优势：便捷、英语、各语种"
- Alternating left/right image layout
- **Services:**
  - 医术可靠，沟通流畅 (Reliable medical communication)
  - 多语言覆盖，精准沟通 (Multilingual precise communication)
  - 随时响应，紧急支持 (24/7 emergency support)

## Usage

```tsx
import {
  HeroSection,
  ComprehensiveServiceSection,
  QualityAssuranceSection,
  LanguageSupportSection,
} from '@/components/language-interpreter';

export default function Page() {
  return (
    <>
      <HeroSection />
      <ComprehensiveServiceSection />
      <QualityAssuranceSection />
      <LanguageSupportSection />
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
- Grid gap: gap-8 to gap-12 (32px-48px)
- Card padding: p-8 (32px)

### Component Patterns
- **Large Icons:** 80px circular icons with white graphics on teal background
- **Image Cards:** 320px height, rounded-2xl, shadow-xl
- **Alternating Layout:** Flex-row with reverse for alternating placement
- **Gradients:** Teal gradient overlays on hero images

## Assets

All images in `/public/language-interpreter/`:
- `hero-banner.png` - Hero background (1434 x 624px)
- `interpreter-icon.png` - Interpreter icon (273 x 126px)
- `medical-interpretation.png` - Medical interpretation (1377 x 978px)
- `multilingual-support.png` - Multilingual support (1007 x 438px)
- `emergency-interpretation.png` - Emergency interpretation (1007 x 438px)

## Responsive Design

### Mobile (< 768px)
- Single column layouts
- Stacked content
- Reduced padding and font sizes
- 400px hero height

### Tablet (768px - 1024px)
- 2-column grids
- Medium padding
- Standard font sizes

### Desktop (> 1024px)
- 2-3 column grids
- Full padding
- Large font sizes
- 500px hero height

## Content Language

This page is primarily in Chinese with English metadata:
- Hero description in Chinese
- All service descriptions in Chinese
- Feature titles in Chinese
- Detailed explanations in Chinese
- Metadata and alt texts in English

## Supported Languages

The service covers 20+ languages including:
- English (英语)
- Japanese (日语)
- Korean (韩语)
- Russian (俄语)
- Arabic (阿拉伯语)
- French (法语)
- German (德语)
- Spanish (西班牙语)
- And more...

## Key Features

✅ **No design-tokens dependency** - All colors are direct values
✅ **Modular architecture** - Self-contained components
✅ **Chinese content** - Native language descriptions
✅ **Pixel-perfect design** - Matches Figma screenshot
✅ **Responsive layouts** - Mobile-first approach
✅ **Optimized images** - Next.js Image component
✅ **Professional medical focus** - Healthcare-specific interpretation
✅ **24/7 availability** - Emergency support emphasis
✅ **Multilingual coverage** - 20+ languages supported
✅ **Confidentiality** - Privacy protection highlighted
