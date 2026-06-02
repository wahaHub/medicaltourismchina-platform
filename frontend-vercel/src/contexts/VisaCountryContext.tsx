import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getVisaStatus, type VisaStatus } from "@/data/visaCountries";

interface VisaCountryContextType {
  detectedCountry: string | null;
  selectedCountry: string | null;
  activeCountry: string | null;
  visaStatus: VisaStatus | null;
  isLoading: boolean;
  setSelectedCountry: (country: string | null) => void;
}

const VisaCountryContext = createContext<VisaCountryContextType | null>(null);

export function VisaCountryProvider({ children }: { children: ReactNode }) {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the active country (user-selected or auto-detected)
  const activeCountry = selectedCountry || detectedCountry;
  const visaStatus = activeCountry ? getVisaStatus(activeCountry) : null;

  // Detect user's country on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/country_code/");
        if (response.ok) {
          const countryCode = await response.text();
          setDetectedCountry(countryCode.trim().toUpperCase());
        }
      } catch {
        setDetectedCountry(null);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  return (
    <VisaCountryContext.Provider
      value={{
        detectedCountry,
        selectedCountry,
        activeCountry,
        visaStatus,
        isLoading,
        setSelectedCountry,
      }}
    >
      {children}
    </VisaCountryContext.Provider>
  );
}

export function useVisaCountry() {
  const context = useContext(VisaCountryContext);
  if (!context) {
    throw new Error("useVisaCountry must be used within a VisaCountryProvider");
  }
  return context;
}
