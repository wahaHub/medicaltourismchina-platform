
import { Mail, FilePen, Calendar, MessageCircle } from "lucide-react";

const Process = () => {
  const steps = [
    {
      icon: <Mail className="h-12 w-12 text-mintGreen" />,
      title: "Online Inquiry",
      description: "Submit your medical information and requirements through our secure portal."
    },
    {
      icon: <FilePen className="h-12 w-12 text-mintGreen" />,
      title: "Personalized Plan",
      description: "Receive a tailored treatment plan, hospital options, and cost estimate within 48 hours."
    },
    {
      icon: <Calendar className="h-12 w-12 text-mintGreen" />,
      title: "Hospital Appointment",
      description: "We arrange your hospital admission, visa support, and accommodation in China."
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-mintGreen" />,
      title: "Post-treatment Follow-up",
      description: "Continuous support after your procedure, including telemedicine consultations."
    }
  ];

  return (
    <section className="section-padding bg-tiffanyBlue/20">
      <div className="container mx-auto">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Our streamlined process makes your medical journey to China simple, safe and stress-free
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-mintGreen/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-card relative"
              >
                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-mintGreen/10 mb-4">
                  {step.icon}
                </div>
                <div className="absolute top-20 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-mintGreen text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
