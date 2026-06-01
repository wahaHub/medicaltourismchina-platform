import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const faqIndices = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function ConciergeFAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-14 md:mb-16"
        >
          <span
            className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4 block"
            style={{ color: "#1DA78A" }}
          >
            {t("concierge.faq.sectionLabel")}
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "#003B5C" }}
          >
            {t("concierge.faq.title")}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            {t("concierge.faq.subtitle")}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3 sm:space-y-4">
          {faqIndices.map((num, index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="border border-gray-200 rounded-2xl bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left focus:outline-none group"
              >
                <span
                  className="font-semibold text-base sm:text-lg transition-colors"
                  style={{ color: "#003B5C" }}
                >
                  {t(`concierge.faq.q${num}`)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 shrink-0 ml-4 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  style={{ color: "#1DA78A" }}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 sm:px-8 pb-5 sm:pb-6 text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                      {t(`concierge.faq.a${num}`)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
