
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      country: "United States",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "I was apprehensive about traveling to China for medical treatment, but the entire experience exceeded my expectations. The hospital was state-of-the-art, doctors were world-class, and I saved over 65% compared to US prices."
    },
    {
      name: "Michael Schneider",
      country: "Germany",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "The stem cell therapy I received in Shanghai was unavailable in Europe. Not only did I get cutting-edge treatment, but the support services made the whole journey stress-free. My health has improved dramatically."
    },
    {
      name: "Emma Thompson",
      country: "United Kingdom",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 4,
      testimonial: "From airport pickup to post-treatment care, every detail was handled with professionalism. My medical team in Beijing provided exceptional care, and I'm thrilled with the results of my procedure."
    },
    {
      name: "Robert Laurent",
      country: "France",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      testimonial: "The cardiac treatment I received in Guangzhou was performed by specialists trained in the US and Europe. The quality was comparable to the best hospitals in Paris, but at a fraction of the cost."
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="section-padding bg-white" id="testimonials">
      <div className="container mx-auto">
        <h2 className="section-title">Patient Stories</h2>
        <p className="section-subtitle">
          Hear from our international patients who have experienced successful medical journeys in China
        </p>

        <div className="relative max-w-4xl mx-auto mt-12">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="min-w-full p-4"
                >
                  <div className="bg-lightGray rounded-2xl p-8 text-center shadow-card">
                    <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.testimonial}"
                    </p>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md text-mintGreen hover:text-white hover:bg-mintGreen transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10 bg-white rounded-full p-2 shadow-md text-mintGreen hover:text-white hover:bg-mintGreen transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-3 w-3 mx-1 rounded-full transition-colors",
                currentIndex === index ? "bg-mintGreen" : "bg-gray-300"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
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

export default Testimonials;
