import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonialIndices = [1, 2, 3] as const;

export default function ConciergeTestimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 md:mb-20"
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "#003B5C" }}
          >
            {t("concierge.testimonials.title")}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            {t("concierge.testimonials.subtitle")}
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonialIndices.map((num, index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="bg-white p-7 sm:p-8 md:p-10 rounded-2xl shadow-card border border-gray-100 relative"
            >
              <Quote className="w-9 h-9 sm:w-10 sm:h-10 absolute top-7 left-7 sm:top-8 sm:left-8 text-[#1DA78A]/20" />
              <p
                className="text-base sm:text-lg leading-relaxed italic mb-7 sm:mb-8 relative z-10 pt-4"
                style={{ color: "#003B5C" }}
              >
                &ldquo;{t(`concierge.testimonials.quote${num}`)}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] flex items-center justify-center text-white font-bold text-sm">
                  {t(`concierge.testimonials.author${num}`).charAt(0)}
                </div>
                <div>
                  <h4
                    className="font-semibold text-sm sm:text-base"
                    style={{ color: "#003B5C" }}
                  >
                    {t(`concierge.testimonials.author${num}`)}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t(`concierge.testimonials.role${num}`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
