
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

const LatestArticles = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const articles = [
    {
      title: "CAR-T Cell Therapy: China's Breakthrough Approach to Cancer Treatment",
      date: "May 15, 2025",
      image: "https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      summary: "Learn how China's innovative approach to CAR-T cell therapy is offering new hope for cancer patients at a fraction of Western costs."
    },
    {
      title: "A Patient's Guide to Medical Travel in Shanghai",
      date: "May 8, 2025",
      image: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      summary: "Everything you need to know about medical facilities, accommodation, transportation, and leisure activities during your treatment in Shanghai."
    },
    {
      title: "The Future of Regenerative Medicine: China's Stem Cell Research",
      date: "April 29, 2025",
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      summary: "Discover how China has become a global leader in stem cell research and regenerative medicine, offering treatments unavailable elsewhere."
    },
    {
      title: "How to Prepare for Your Medical Trip to China",
      date: "April 22, 2025",
      image: "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      summary: "A comprehensive checklist for international patients: documents, insurance, packing essentials, and cultural preparation."
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollAmount = 320; // Width of a card + gap
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        setScrollPosition(Math.max(scrollPosition - scrollAmount, 0));
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setScrollPosition(Math.min(scrollPosition + scrollAmount, container.scrollWidth - container.clientWidth));
      }
    }
  };

  return (
    <section className="py-16 bg-lightGray" id="blog">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <p className="text-gray-600 mt-2">Stay informed about medical tourism in China</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')} 
              className="rounded-full p-2 bg-white shadow-md text-gray-700 hover:bg-mintGreen hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="rounded-full p-2 bg-white shadow-md text-gray-700 hover:bg-mintGreen hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={containerRef} 
            className="flex space-x-6 overflow-x-auto scrollbar-none pb-4"
          >
            {articles.map((article, index) => (
              <div 
                key={index} 
                className="flex-none w-[300px] bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <span className="text-sm text-gray-500">{article.date}</span>
                  <h3 className="font-bold text-lg mt-1 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{article.summary}</p>
                  <Button variant="link" className="text-mintGreen p-0 mt-3">
                    Read More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="outline" className="border-mintGreen text-mintGreen hover:bg-mintGreen/5">
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
