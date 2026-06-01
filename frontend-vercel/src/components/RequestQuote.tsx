
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const RequestQuote = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Start showing the sticky panel after scrolling down a bit
      if (window.scrollY > 500) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed right-0 top-1/3 z-30 transition-transform duration-300 lg:block hidden
        ${isSticky ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="w-80 bg-white rounded-l-xl shadow-lg overflow-hidden">
        <div className="bg-mintGreen p-4">
          <h3 className="text-white text-xl font-bold">Request Your Free Quote</h3>
        </div>
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <Input type="text" placeholder="Your Name" />
            </div>
            <div>
              <Input type="email" placeholder="Email Address" />
            </div>
            <div>
              <Input type="tel" placeholder="Phone Number" />
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 leading-tight cursor-pointer"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            <Button className="w-full bg-coral hover:bg-coral/90 text-white">
              Send Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;
