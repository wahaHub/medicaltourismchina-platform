
import { Button } from "@/components/ui/button";

const Resources = () => {
  const resources = [
    {
      title: "Chinese Medical Tourism: What to Expect",
      summary: "Learn about the process, benefits, and what to prepare before your medical journey to China.",
      image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Guides",
      date: "May 15, 2025",
    },
    {
      title: "Advanced Cancer Treatments in China: A Comprehensive Review",
      summary: "Explore cutting-edge oncology treatments available in Chinese hospitals that are pioneering medical innovation.",
      image: "https://images.unsplash.com/photo-1579154341098-e4e158cc7f50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Medical",
      date: "April 30, 2025",
    },
    {
      title: "Patient Guide: Navigating Chinese Culture During Your Stay",
      summary: "Essential cultural tips and language basics to enhance your medical trip and overall experience in China.",
      image: "https://images.unsplash.com/photo-1518632257175-38508f09c0b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      category: "Culture",
      date: "April 22, 2025",
    },
  ];

  const categories = ["All", "Guides", "Medical", "Culture", "Insurance", "Testimonials"];

  return (
    <section className="section-padding bg-lightGray" id="resources">
      <div className="container mx-auto">
        <h2 className="section-title">Resources & Articles</h2>
        <p className="section-subtitle">
          Stay informed with our latest guides, medical insights, and patient stories
        </p>

        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? "bg-mintGreen text-white"
                    : "bg-white text-gray-700 hover:bg-mintGreen/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="card overflow-hidden group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-mintGreen/10 text-mintGreen text-xs font-semibold px-2 py-1 rounded-full">
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-500">{resource.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {resource.summary}
                </p>
                <Button variant="link" className="p-0 h-auto text-mintGreen">
                  Read More
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button className="btn-primary">View All Articles</Button>
        </div>
      </div>
    </section>
  );
};

export default Resources;
