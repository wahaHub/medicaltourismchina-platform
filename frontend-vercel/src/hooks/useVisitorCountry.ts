import { useEffect, useState } from "react";

export function useVisitorCountry(): string | null {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCountry = async () => {
      try {
        const response = await fetch("/api/visitor-country", {
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;

        const payload = await response.json() as { country?: string };
        const resolvedCountry = payload.country?.trim().toUpperCase();
        if (active && resolvedCountry) setCountry(resolvedCountry);
      } catch {
        // Locale-based currency is the intentional fallback when geolocation is unavailable.
      }
    };

    void loadCountry();
    return () => {
      active = false;
    };
  }, []);

  return country;
}
