import type { WorkWithUsTabId } from "@/pages/workWithUsContent";

export const workWithUsTabTheme: Record<
  WorkWithUsTabId,
  {
    button: string;
    iconBg: string;
    sectionBg: string;
    callout: string;
    cta: string;
    step: string;
  }
> = {
  hospitals: {
    button: "data-[active=true]:bg-[#0F638E] data-[active=true]:text-white",
    iconBg: "bg-[#DFF0FA]",
    sectionBg: "from-[#EAF6FF] to-white",
    callout: "border-[#0F638E]/20 bg-[#EAF6FF] text-[#0A4D6F]",
    cta: "from-[#1DA78A] to-[#0F638E]",
    step: "bg-[#DFF0FA] text-[#0F638E]",
  },
  "referral-partners": {
    button: "data-[active=true]:bg-[#1F7A52] data-[active=true]:text-white",
    iconBg: "bg-[#E8F7EE]",
    sectionBg: "from-[#EDF9F2] to-white",
    callout: "border-[#1F7A52]/20 bg-[#EDF9F2] text-[#14543A]",
    cta: "from-[#1F7A52] to-[#2A8E5F]",
    step: "bg-[#E8F7EE] text-[#1F7A52]",
  },
  "travel-services": {
    button: "data-[active=true]:bg-[#A65C1B] data-[active=true]:text-white",
    iconBg: "bg-[#FFF1E6]",
    sectionBg: "from-[#FFF4EB] to-white",
    callout: "border-[#A65C1B]/20 bg-[#FFF4EB] text-[#7D430F]",
    cta: "from-[#D9842B] to-[#A65C1B]",
    step: "bg-[#FFF1E6] text-[#A65C1B]",
  },
};

export const workWithUsBadgeTheme = {
  blue: "border-[#B9D9EC] bg-[#EEF7FD] text-[#0F638E]",
  green: "border-[#B9E0C7] bg-[#EEF8F1] text-[#1F7A52]",
  teal: "border-[#B8E3E1] bg-[#EEF9F8] text-[#0F6E6E]",
  amber: "border-[#F0D1B0] bg-[#FFF5EC] text-[#A65C1B]",
  coral: "border-[#EACBBE] bg-[#FFF1EA] text-[#8B4A12]",
} as const;
