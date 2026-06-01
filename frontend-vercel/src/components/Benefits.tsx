
import PlaceholderIcon from "@/components/ui/placeholder-icon";

const Benefits = () => {
  const benefits = [
    {
      icon: <PlaceholderIcon size={36} />,
      title: "Cost Savings",
      description: "Save up to 70% on healthcare compared to US and EU prices while receiving equivalent or superior care.",
    },
    {
      icon: <PlaceholderIcon size={36} />,
      title: "Top-tier Hospitals",
      description: "Partnered with China's leading JCI-accredited medical centers with state-of-the-art facilities.",
    },
    {
      icon: <PlaceholderIcon size={36} />,
      title: "Concierge Service",
      description: "Comprehensive support including airport pickup, lodging assistance, and translation services.",
    },
    {
      icon: <PlaceholderIcon size={36} />,
      title: "Safety & Compliance",
      description: "All partner providers are licensed with international certifications and malpractice coverage.",
    },
  ];

  return (
    <section className="section-padding bg-lightGray" id="about">
      <div className="container mx-auto">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">
          Experience premium care with significant savings when you choose our medical tourism services in China
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card p-6 group"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600 mb-4">{benefit.description}</p>
              <a
                href="#"
                className="text-mintGreen font-medium inline-flex items-center hover:underline"
              >
                Learn More
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
