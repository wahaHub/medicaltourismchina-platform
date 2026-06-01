

// Next Image removed;

const facilities = [
  {
    id: 1,
    image: "/hospital-detail/facility_1.png",
    title: "International Medical Center/International Outpatient Clinic",
    description:
      "We provide international patients with multilingual services, one-stop registration, payment, medicine collection, reports, and direct imaging examinations to meet the needs of international patients and high-end physical examinations.",
    titleColor: "text-[#003B59]",
  },
  {
    id: 2,
    image: "/hospital-detail/facility_2.png",
    title: "National Chest Pain Center and Stroke Green Channel",
    description:
      "Realize the integrated treatment process of 'pre-hospital, in-hospital, and rehabilitation', greatly reducing the D2B and DNT time.",
    titleColor: "text-[#003B59]",
  },
  {
    id: 3,
    image: "/hospital-detail/facility_3.png",
    title: "Medical Imaging AI and Data Center",
    description:
      "Intelligent triage and risk prediction based on big data to assist in screening for pulmonary nodules, coronary artery calcification, and early signs of stroke.",
    titleColor: "text-[#003B59]",
  },
  {
    id: 4,
    image: "/hospital-detail/facility_4.png",
    title: "Day Surgery and Rapid Rehabilitation Surgery Center",
    description:
      "Multidisciplinary collaboration and standardized pathways during the perioperative period can shorten hospitalization time, improve surgical turnover, and enhance patient experience.",
    titleColor: "text-[#003B59]",
  },
  {
    id: 5,
    image: "/hospital-detail/facility_5.png",
    title: "Advanced Intensive Care and Negative Pressure Isolation Unit",
    description:
      "Configure multifunctional monitoring, bedside ultrasound, hemodynamic evaluation, and ECMO transport capabilities to meet the needs of sudden public health emergencies and critical care.",
    titleColor: "text-[#003B59]",
  },
];

export default function SpecialFacilities() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#F2F6F9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
          Special Facilities
        </h2>

        {/* Facilities Grid - 2 columns on mobile/tablet, 3 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {/* First Row - Large Card (2 columns) + Regular Card (1 column) */}

          {/* Large Card - International Medical Center (1 column on mobile/tablet, 2 columns on desktop) */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4">
            {/* Mobile/Tablet: Vertical Layout (Image on top) */}
            <div className="lg:hidden">
              <div className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden mb-4">
                <img
                  src={facilities[0].image}
                  alt={facilities[0].title}
                  className="w-full h-full object-cover"
                  className="object-cover"
                  
                  
                />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#003B59] mb-2 sm:mb-3 leading-tight">
                  {facilities[0].title}
                </h3>
                <p className="text-xs text-[#374151] leading-relaxed">
                  {facilities[0].description}
                </p>
              </div>
            </div>

            {/* Desktop: Horizontal Layout (Text left, Image right) */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4 h-full">
              {/* Left Side - Text Content */}
              <div className="flex flex-col justify-center">
                <h3 className="text-base sm:text-base md:text-lg font-semibold text-[#003B59] mb-3 sm:mb-4 leading-tight">
                  {facilities[0].title}
                </h3>
                <p className="text-xs text-[#374151] leading-relaxed">
                  {facilities[0].description}
                </p>
              </div>

              {/* Right Side - Image with border radius */}
              <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden">
                <img
                  src={facilities[0].image}
                  alt={facilities[0].title}
                  className="w-full h-full object-cover"
                  className="object-cover"
                  
                  
                />
              </div>
            </div>
          </div>

          {/* Regular Card - National Chest Pain Center (1 column on all screens) */}
          <div className="col-span-1 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4">
            {/* Image */}
            <div className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden mb-4">
              <img
                src={facilities[1].image}
                alt={facilities[1].title}
                className="w-full h-full object-cover"
                className="object-cover"
                
                
              />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#003B59] mb-2 sm:mb-3 leading-tight">
                {facilities[1].title}
              </h3>
              <p className="text-xs text-[#374151] leading-relaxed">
                {facilities[1].description}
              </p>
            </div>
          </div>

          {/* Second Row - 3 Regular Cards */}
          {facilities.slice(2).map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4"
            >
              {/* Image */}
              <div className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden mb-4">
                <img
                  src={facility.image}
                  alt={facility.title}
                  className="w-full h-full object-cover"
                  className="object-cover"
                  
                  
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-base sm:text-base md:text-lg font-semibold text-[#003B59] mb-3 sm:mb-4 leading-tight">
                  {facility.title}
                </h3>
                <p className="text-xs text-[#374151] leading-relaxed">
                  {facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
