import { motion } from "framer-motion";
import {
  Video,
  Activity,
  FlaskConical,
  MapPin,
  FileCheck,
  ShieldPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const serviceKeys = [
  { key: "consultation", icon: Video, image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { key: "exams", icon: Activity, image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { key: "trials", icon: FlaskConical, image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { key: "onGround", icon: MapPin, image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { key: "visa", icon: FileCheck, image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { key: "checkups", icon: ShieldPlus, image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
] as const;

export default function ConciergeServices() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 md:mb-20">
          <span
            className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4 block"
            style={{ color: "#1DA78A" }}
          >
            {t("concierge.services.sectionLabel")}
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "#003B5C" }}
          >
            {t("concierge.services.sectionTitle")}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            {t("concierge.services.sectionSubtitle")}
          </p>
        </div>

        {/* Services List */}
        <div className="space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-28">
          {serviceKeys.map((service, index) => {
            const Icon = service.icon;
            const benefits = [
              t(`concierge.services.${service.key}.benefit1`),
              t(`concierge.services.${service.key}.benefit2`),
              t(`concierge.services.${service.key}.benefit3`),
              t(`concierge.services.${service.key}.benefit4`),
            ];

            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center ${
                  index % 2 !== 0 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[4/3] group">
                    <img
                      src={service.image}
                      alt={t(`concierge.services.${service.key}.title`)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {/* Icon Badge */}
                    <div className="absolute top-5 left-5 w-11 h-11 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                      <Icon
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: "#1DA78A" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2">
                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
                    style={{ color: "#003B5C" }}
                  >
                    {t(`concierge.services.${service.key}.title`)}
                  </h3>
                  {/* Positioning Statement */}
                  <p
                    className="text-lg sm:text-xl italic mb-6 sm:mb-8 pl-4 border-l-[3px]"
                    style={{
                      color: "#0F638E",
                      borderColor: "#1DA78A",
                    }}
                  >
                    {t(`concierge.services.${service.key}.positioning`)}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                    {benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: "#1DA78A" }}
                        />
                        <span className="leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/free-quote"
                      className="inline-flex items-center justify-center bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                    >
                      {t("concierge.services.bookNow")}
                    </Link>
                    <Link
                      to="/free-quote"
                      className="inline-flex items-center justify-center bg-transparent border border-gray-300 text-[#003B5C] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      {t("concierge.services.learnMore")}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
