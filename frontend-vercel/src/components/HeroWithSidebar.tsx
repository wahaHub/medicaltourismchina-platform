
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroWithSidebar = () => {
  return (
    <section className="relative flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      {/* Hero Section - 60% */}
      <div className="w-full lg:w-[60%] relative flex items-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mintGreen/40 to-mintGreen/20 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-8 relative z-10 animate-fade-in py-16 lg:py-0">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Premium Medical Travel to China
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Experience world-class treatments at 50–70% lower cost with personalized care
              and support every step of the way.
            </p>
            <Button className="btn-primary text-lg py-6 px-8">
              Get a Free Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Sidebar - 40% */}
      <div className="w-full lg:w-[40%] bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Find Your Treatment</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stem-cell">Stem Cell Therapy</SelectItem>
                  <SelectItem value="cosmetic">Cosmetic Surgery</SelectItem>
                  <SelectItem value="cart">CAR-T Cell Therapy</SelectItem>
                  <SelectItem value="checkup">Deep Health Checkup</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shanghai">Shanghai</SelectItem>
                  <SelectItem value="beijing">Beijing</SelectItem>
                  <SelectItem value="guangzhou">Guangzhou</SelectItem>
                  <SelectItem value="shenzhen">Shenzhen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget Range
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget1">$5,000 - $10,000</SelectItem>
                  <SelectItem value="budget2">$10,000 - $25,000</SelectItem>
                  <SelectItem value="budget3">$25,000 - $50,000</SelectItem>
                  <SelectItem value="budget4">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full py-6 text-lg bg-coral hover:bg-coral/90 text-white">
              <Search className="mr-2 h-5 w-5" /> Search Treatments
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWithSidebar;
