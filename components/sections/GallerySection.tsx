"use client";

import { useState } from 'react';

const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    title: 'Advanced Manufacturing Lab',
    category: 'facilities'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    title: 'Research Collaboration',
    category: 'research'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
    title: 'Innovation Workshop',
    category: 'events'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg',
    title: 'Technical Presentation',
    category: 'events'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    title: 'Team Development',
    category: 'team'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/356043/pexels-photo-356043.jpeg',
    title: 'Energy Systems Lab',
    category: 'facilities'
  },
  {
    id: 7,
    src: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    title: 'Achievement Recognition',
    category: 'events'
  },
  {
    id: 8,
    src: 'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg',
    title: 'Robotics Development',
    category: 'research'
  },
  {
    id: 9,
    src: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg',
    title: 'Collaborative Innovation',
    category: 'team'
  }
];

const categories = ['all', 'facilities', 'research', 'events', 'team'];

export default function GallerySection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Gallery
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Showcasing our state-of-the-art facilities, research activities, and collaborative achievements
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full transition-all duration-300 capitalize ${
                selectedCategory === category
                  ? 'accent-gradient text-white shadow-lg'
                  : 'sleek-card text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-xl sleek-card"
              style={{animationDelay: `${index * 0.05}s`}}
              onClick={() => setSelectedImage(image.id)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-medium text-sm mb-1">
                    {image.title}
                  </h3>
                  <span className="text-blue-400 text-xs capitalize">
                    {image.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={galleryImages.find(img => img.id === selectedImage)?.src}
                alt={galleryImages.find(img => img.id === selectedImage)?.title}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full sleek-card flex items-center justify-center text-white hover:bg-white/10 transition-colors text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}