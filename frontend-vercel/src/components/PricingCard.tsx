import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PricingFeature {
  text: string;
  bold?: boolean;
}

interface PricingCardProps {
  badge: string;
  title: string;
  price: string;
  features: PricingFeature[];
  showBooking?: boolean;
  href?: string;
}

export default function PricingCard({
  badge,
  title,
  price,
  features,
  showBooking = false,
  href,
}: PricingCardProps) {
  return (
    <Card className="h-full border-gray-200 shadow-sm">
      <CardHeader className="items-center text-center">
        <img src={badge} alt="" className="h-16 w-16 object-contain" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-3xl font-black text-mintGreen">{price}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mintGreen" />
              <span className={feature.bold ? "font-semibold text-gray-950" : ""}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        {showBooking && href ? (
          <Button asChild className="w-full bg-mintGreen hover:bg-mintGreen/90">
            <a href={href} target="_blank" rel="noreferrer">
              Book Package
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
