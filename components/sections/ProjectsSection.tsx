"use client";

import { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Autonomous Systems Research',
    category: 'Robotics',
    image: 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg',
    description: 'Advanced autonomous navigation and decision-making systems for industrial applications',
    tech: ['ROS', 'Computer Vision', 'Machine Learning'],
    status: 'Active'
  },
  {
    id: 2,
    title: 'Smart Grid Integration',
    category: 'Energy',
    image: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
    description: 'Intelligent power distribution systems with renewable energy integration',
    tech: ['IoT', 'Power Electronics', 'Data Analytics'],
    status: 'Active'
  },
  {
    id: 3,
    title: 'Biomedical Devices',
    category: 'Healthcare',
    image: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
    description: 'Next-generation medical monitoring and diagnostic equipment',
    tech: ['Embedded Systems', 'Signal Processing', 'UI/UX'],
    status: 'Completed'
  },
  {
    id: 4,
    title: 'Advanced Materials',
    category: 'Materials',
    image: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg',
    description: 'Novel composite materials for aerospace and automotive applications',
    tech: ['Materials Science', 'Testing', 'Simulation'],
    status: 'Research'
  },
  {
    id: 5,
    title: 'AI-Driven Manufacturing',
    category: 'AI',
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
    description: 'Intelligent manufacturing systems with predictive maintenance capabilities',
    tech: ['Machine Learning', 'Computer Vision', 'Industrial IoT'],
    status: 'Active'
  },
  {
    id: 6,
    title: 'Environmental Monitoring',
    category: 'IoT',
    image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg',
    description: 'Large-scale environmental sensing networks for climate research',
    tech: ['Sensor Networks', 'Data Analytics', 'Cloud Computing'],
    status: 'Active'
  }
];

const categories = ['All', 'Robotics', 'Energy', 'Healthcare', 'Materials', 'AI', 'IoT'];

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <section id="projects" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Research Projects
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Breakthrough research initiatives addressing real-world challenges
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                activeCategory === category
                  ? 'accent-gradient text-white shadow-lg'
                  : 'sleek-card text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="project-card sleek-card rounded-2xl overflow-hidden transition-all duration-300"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Active' ? 'bg-green-600 text-white' :
                    project.status === 'Completed' ? 'bg-blue-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {project.title}
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                    {project.category}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span key={tech} className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">
                    <ExternalLink size={14} />
                    Details
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">
                    <Github size={14} />
                    Repository
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}