
const Partners = () => {
  const partners = [
    {
      name: "Beijing United Family Hospital",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Shanghai International Medical Center",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Guangzhou United Family Hospital",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Shenzhen International Medical Center",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "JCI Accreditation",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "International Patient Services Association",
      logo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto">
        <h2 className="section-title">Our Partners & Accreditations</h2>
        <p className="section-subtitle">
          We collaborate with internationally recognized hospitals and organizations
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-10">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex flex-col items-center grayscale hover:grayscale-0 transition-all"
            >
              <div className="h-16 w-24 md:h-20 md:w-32 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
