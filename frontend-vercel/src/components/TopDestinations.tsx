
import { Button } from "@/components/ui/button";

const TopDestinations = () => {
  const destinations = [
    {
      city: "Shanghai",
      image: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      city: "Beijing",
      image: "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      city: "Guangzhou",
      image: "https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      city: "Shenzhen",
      image: "https://images.unsplash.com/photo-1522951558753-98e8e0c8b5cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    }
  ];

  return (
    <section className="py-16 bg-white" id="destinations">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Destinations - Left 50% */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Top Destinations</h2>
            <div className="grid grid-cols-2 gap-4">
              {destinations.map((destination, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-md h-48 group hover:-translate-y-1 transition-transform duration-300"
                >
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{destination.city}</h3>
                    <Button variant="link" className="text-white p-0 hover:text-mintGreen">
                      Explore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why China - Right 50% */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Why China?</h2>
            <p className="text-gray-600 mb-6">
              China has rapidly emerged as a leading medical tourism destination, combining cutting-edge technology with affordability and comprehensive care for international patients.
            </p>
            <ul className="space-y-4">
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-mintGreen flex items-center justify-center text-white font-bold mr-3">✓</div>
                <p><span className="font-semibold">Advanced Oncology:</span> Access to breakthrough cancer treatments including next-generation immunotherapies</p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-mintGreen flex items-center justify-center text-white font-bold mr-3">✓</div>
                <p><span className="font-semibold">Regenerative Medicine Leadership:</span> World-leading stem cell therapies and regenerative treatments</p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-mintGreen flex items-center justify-center text-white font-bold mr-3">✓</div>
                <p><span className="font-semibold">Mandarin-English Support:</span> Dedicated international patient services with fluent English speakers</p>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-mintGreen flex items-center justify-center text-white font-bold mr-3">✓</div>
                <p><span className="font-semibold">Cost Efficiency:</span> Save 50-70% compared to the US and Europe without compromising quality</p>
              </li>
            </ul>
            <Button className="mt-6 bg-mintGreen text-white hover:bg-mintGreen/90">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopDestinations;
