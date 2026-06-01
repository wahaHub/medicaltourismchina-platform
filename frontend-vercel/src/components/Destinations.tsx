
import { Button } from "@/components/ui/button";

const Destinations = () => {
  const destinations = [
    {
      city: "Shanghai",
      image: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      hospitals: 12,
      specialties: ["Oncology", "Cardiology", "Neurology"]
    },
    {
      city: "Beijing",
      image: "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      hospitals: 10,
      specialties: ["Orthopedics", "Reproductive Medicine", "Pediatrics"]
    },
    {
      city: "Guangzhou",
      image: "https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      hospitals: 8,
      specialties: ["Ophthalmology", "Dermatology", "Dentistry"]
    },
    {
      city: "Shenzhen",
      image: "https://images.unsplash.com/photo-1522951558753-98e8e0c8b5cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      hospitals: 7,
      specialties: ["Stem Cell Therapy", "Plastic Surgery", "Rehabilitation"]
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-white to-lightGray" id="destinations">
      <div className="container mx-auto">
        <h2 className="section-title">Our Medical Destinations</h2>
        <p className="section-subtitle">
          Explore China's premier medical cities with world-class hospitals and specialists
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="card overflow-hidden h-[400px] relative group"
            >
              <div className="absolute inset-0">
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{destination.city}</h3>
                <p className="mb-1 text-white/80">{destination.hospitals} Partner Hospitals</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.specialties.map((specialty, i) => (
                    <span key={i} className="text-xs bg-white/20 rounded-full px-2 py-1 backdrop-blur-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-white text-gray-800 hover:bg-white/90 transition-all"
                >
                  Explore
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="outline" className="btn-secondary">
            View All Destinations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
