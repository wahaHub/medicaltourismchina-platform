

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InsuranceFAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      questionKey: "insurance.faq.q1.question",
      answerKey: "insurance.faq.q1.answer"
    },
    {
      questionKey: "insurance.faq.q2.question",
      answerKey: "insurance.faq.q2.answer"
    },
    {
      questionKey: "insurance.faq.q3.question",
      answerKey: "insurance.faq.q3.answer"
    }
  ];

  return (
    <section className="py-20 bg-[#f2f6f9]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#003b59] mb-4">
            {t('insurance.faq.title')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('insurance.faq.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-[#003b59] pr-4">
                  Q{index + 1}: {t(faq.questionKey)}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-[#038a81] flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-8 pb-6 text-gray-600 leading-relaxed">
                  {t(faq.answerKey)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
