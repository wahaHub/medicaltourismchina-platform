import { useLanguage } from "@/contexts/LanguageContext";

export default function VehicleOptionsSection() {
  const { t } = useLanguage();
  
  const vehicles = [
    {
      image: '/airport-pickup/car-sedan.png',
      titleKey: 'airportPickup.vehicles.vehicle1.title',
      itemKeys: [
        'airportPickup.vehicles.vehicle1.item1',
        'airportPickup.vehicles.vehicle1.item2'
      ],
    },
    {
      image: '/airport-pickup/car-suv.png',
      titleKey: 'airportPickup.vehicles.vehicle2.title',
      itemKeys: [
        'airportPickup.vehicles.vehicle2.item1',
      ],
    },
    {
      image: '/airport-pickup/car-van.png',
      titleKey: 'airportPickup.vehicles.vehicle3.title',
      itemKeys: [
        'airportPickup.vehicles.vehicle3.item1'
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#14B8A6] mb-4">
            {t('airportPickup.vehicles.mainTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative h-48 bg-transparent">
                <img
                  src={vehicle.image}
                  alt={t(vehicle.titleKey)}
                  className="w-full h-full object-contain mt-3"
                />
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow -mt-8 flex-1 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4 text-center">{t(vehicle.titleKey)}</h4>
                  <ul className="space-y-3 text-gray-600 text-[12px] leading-relaxed flex-1">
                    {vehicle.itemKeys.map((key, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#14B8A6] mr-3 mt-1">•</span>
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
