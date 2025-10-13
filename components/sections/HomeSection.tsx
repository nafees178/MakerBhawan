"use client";

import { ChevronDown } from 'lucide-react';

export default function HomeSection() {
  const handleExploreClick = () => {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center relative hero-grid">
      <div className="max-w-6xl mx-auto px-4">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
          <div className="absolute top-60 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>

        <div className="animate-fade-in relative z-10">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold gradient-text tracking-tight leading-none mb-8">
            Anand Rathi Tinkerer's Lab
          </h1>
          
          <h2 className="text-2xl md:text-4xl text-gray-300 mb-6 font-light">
            Innovation Hub & Tinkerer Lab
          </h2>
          
          <p className="text-xl text-blue-400 font-medium mb-12">
            IIT Jodhpur
          </p>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
            Where engineering excellence meets cutting-edge innovation
          </p>
          
          <button className="px-8 py-4 accent-gradient text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium" onClick={handleExploreClick}>
            Explore Our Work
          </button>
        </div>
      </div>
      
      <div className="animate-bounce absolute bottom-8">
        <ChevronDown size={28} className="text-gray-400" />
      </div>
    </section>
  );
}
