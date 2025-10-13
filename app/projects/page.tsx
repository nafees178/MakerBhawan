'use client';

import { useState, useEffect } from 'react';
import { IProjects } from '@/models/project_model';
import DockNavigation from '@/components/DockNavigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<(IProjects & { createdAt: string })[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<(IProjects & { createdAt: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const projectsData = await response.json();
        setProjects(projectsData || []);
        setFilteredProjects(projectsData || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  return (
    <main className="relative min-h-screen">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse"></div>
        </div>
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Our Projects
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Explore the innovative projects and creative solutions developed by our talented community
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Projects List */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-3xl bg-gray-800/40 border border-gray-700/60 animate-pulse" />
              ))}
            </div>
          ) : Array.isArray(filteredProjects) && filteredProjects.length > 0 ? (
            <div className="space-y-6">
              {filteredProjects.map((project: IProjects & { createdAt: string }, index: number) => (
                <div 
                  key={index}
                  className="group relative sleek-card rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] project-card"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-start gap-6">
                    {/* Project Icon */}
                    {/* <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div> */}
                    
                    {/* Project Details */}
                    <div className="flex-1">
                      {/* Project Title */}
                      <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">
                        {project.name}
                      </h2>
                      
                      {/* Project Description */}
                      <div 
                        className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                      />
                      
                      {/* Creation Date */}
                      {project.createdAt && (
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(project.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                {searchTerm ? 'No Projects Found' : 'No Projects Yet'}
              </h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                {searchTerm 
                  ? `No projects match "${searchTerm}". Try a different search term.`
                  : "We're working on some amazing projects. Check back soon to see what we've been building!"
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <DockNavigation />
    </main>
  );
}
