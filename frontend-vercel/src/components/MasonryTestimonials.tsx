
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MasonryTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      country: "United States",
      flag: "🇺🇸",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "I was apprehensive about traveling to China for medical treatment, but the entire experience exceeded my expectations. The hospital was state-of-the-art, doctors were world-class, and I saved over 65% compared to US prices."
    },
    {
      name: "Michael Schneider",
      country: "Germany",
      flag: "🇩🇪",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "The stem cell therapy I received in Shanghai was unavailable in Europe. Not only did I get cutting-edge treatment, but the support services made the whole journey stress-free."
    },
    {
      name: "Emma Thompson",
      country: "United Kingdom",
      flag: "🇬🇧",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 4,
      testimonial: "From airport pickup to post-treatment care, every detail was handled with professionalism. My medical team in Beijing provided exceptional care."
    },
    {
      name: "Robert Laurent",
      country: "France",
      flag: "🇫🇷",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "The cardiac treatment I received in Guangzhou was performed by specialists trained in the US and Europe. The quality was comparable to the best hospitals in Paris, but at a fraction of the cost."
    },
    {
      name: "Olivia Chen",
      country: "Australia",
      flag: "🇦🇺",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "After researching options worldwide, I chose China for my orthopedic surgery. The doctors were attentive, the facilities immaculate, and my recovery exceeded expectations."
    }
  ];

  return (
    <section className="py-16 bg-white" id="testimonials">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">Patient Stories</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto text-center">
          Hear from our international patients who have experienced successful medical journeys in China
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                "bg-lightGray rounded-xl p-6 shadow-md animate-fade-in",
                // Vary the heights of cards for masonry effect
                index % 3 === 0 ? "row-span-1" : "",
                index % 3 === 1 ? "row-span-1 md:row-span-2" : "",
                index % 3 === 2 ? "row-span-1" : ""
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.flag} {testimonial.country}
                  </p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-gray-700 italic">{testimonial.testimonial}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button variant="link" className="text-mintGreen">
            View All Testimonials
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MasonryTestimonials;
