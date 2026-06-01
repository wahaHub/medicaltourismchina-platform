
import { Activity, Dna, Scissors, Syringe, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Services = () => {
  const services = [
    {
      icon: <Activity className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "Deep Health Checkups",
      description: "Comprehensive diagnostics using advanced technology",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Dna className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "Stem Cell Therapy",
      description: "Cutting-edge regenerative treatments",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Scissors className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "Cosmetic Surgery",
      description: "Premium aesthetic procedures at affordable rates",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Syringe className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "CAR-T Cell Therapy",
      description: "Advanced treatments for oncology patients",
      image: "https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Heart className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "Rehabilitation & Wellness",
      description: "Holistic recovery and health enhancement programs",
      image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      icon: <Shield className="h-10 w-10 mb-4 text-mintGreen" />,
      title: "Custom Insurance Plans",
      description: "Tailored coverage for your medical journey",
      image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="py-16 bg-white" id="services">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">Services Spotlight</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto text-center">
          Explore our range of cutting-edge medical treatments available in China
        </p>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent>
            {services.map((service, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
                <div className="card h-full overflow-hidden group">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                    <Button variant="link" className="text-mintGreen p-0">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="relative left-0 top-0 h-10 w-10 rounded-full bg-mintGreen text-white hover:bg-mintGreen/90 translate-x-0 translate-y-0" />
            <CarouselNext className="relative right-0 top-0 h-10 w-10 rounded-full bg-mintGreen text-white hover:bg-mintGreen/90 translate-x-0 translate-y-0 ml-4" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default Services;
