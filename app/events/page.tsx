'use client';

import { useState, useEffect } from 'react';
import { IEvents } from '@/models/event_model';
import DockNavigation from '@/components/DockNavigation';

export default function EventsPage() {
  const [events, setEvents] = useState<(IEvents & { createdAt: string })[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<(IEvents & { createdAt: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const eventsData = await response.json();
        setEvents(eventsData || []);
        setFilteredEvents(eventsData || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setFilteredEvents([]);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  return (
    <main className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-6">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Join us for exciting workshops, competitions, and community gatherings
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
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="max-w-7xl mx-auto">
          {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map((event: IEvents & { createdAt: string }, index: number) => (
                <div 
                  key={index}
                  className="group relative sleek-card rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] project-card"
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-start gap-6">
                    {/* Event Icon */}
                    <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1">
                      {/* Event Title */}
                      <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">
                        {event.name}
                      </h2>
                      
                      {/* Event Description */}
                      <div 
                        className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                      
                      {/* Event Date */}
                      {event.createdAt && (
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.date_event).toLocaleDateString('en-US', {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                {searchTerm ? 'No Events Found' : 'No Events Scheduled'}
              </h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                {searchTerm 
                  ? `No events match "${searchTerm}". Try a different search term.`
                  : "We're planning some amazing events. Stay tuned for updates on upcoming workshops and gatherings!"
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
