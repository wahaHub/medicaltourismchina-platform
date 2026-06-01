

import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

export default function HotelGallerySection() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', labelKey: 'hotelAccommodation.gallery.category1' },
    { id: 'medical', labelKey: 'hotelAccommodation.gallery.category2' },
    { id: 'premium', labelKey: 'hotelAccommodation.gallery.category3' },
  ];

  const images = [
    { src: '/hotel-accommodation/hotel-exterior.png', alt: 'Hotel exterior', category: 'all' },
    { src: '/hotel-accommodation/hotel-gym.png', alt: 'Hotel gym', category: 'medical' },
    { src: '/hotel-accommodation/hotel-room.png', alt: 'Hotel room', category: 'all' },
    { src: '/hotel-accommodation/hotel-dining.png', alt: 'Hotel dining', category: 'premium' },
    { src: '/hotel-accommodation/hotel-lobby.png', alt: 'Hotel lobby', category: 'all' },
    { src: '/hotel-accommodation/hotel-restaurant.png', alt: 'Hotel restaurant', category: 'medical' },
    { src: '/hotel-accommodation/hotel-bathroom.png', alt: 'Hotel bathroom', category: 'premium' },
    { src: '/hotel-accommodation/hotel-entrance.png', alt: 'Hotel entrance', category: 'all' },
  ];

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F0F4F3]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2
            className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('hotelAccommodation.gallery.mainTitle')}
          </h2>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-6 bg-white sm:px-8 md:px-10 py-2.5 sm:py-3 
                rounded-full font-semibold text-sm sm:text-base
                transition-all duration-300 ease-in-out
                ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:text-gray-900 border-0'
                }
              `}
            >
              {t(category.labelKey)}
            </button>
          ))}
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredImages.map((image, index) => (
            <div 
              key={index} 
              className="relative h-40 sm:h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
