

// Next Image removed;

export default function AdvancedEquipment() {
  return (
    <section className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden">
      {/* Background Image */}
      <img
        src="/hospital-detail/instruments_equipments_hospital_banner.png"
        alt="Advanced instruments and equipment in the hospital"
        className="w-full h-full object-cover"
        className="object-cover"
        
        
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Advanced instruments and
            <br />
            equipment in the hospital
          </h2>
        </div>
      </div>
    </section>
  );
}
