"use client";

import { Calendar, MapPin, Users } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Innovation Summit 2024',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Main Auditorium',
    type: 'Conference',
    description: 'Annual showcase of breakthrough research and industry collaborations',
    attendees: 300,
    status: 'upcoming'
  },
  {
    id: 2,
    title: 'Advanced Manufacturing Workshop',
    date: '2024-02-28',
    time: '14:00 PM',
    location: 'Manufacturing Lab',
    type: 'Workshop',
    description: 'Hands-on training in precision manufacturing and quality control',
    attendees: 50,
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Research Symposium',
    date: '2024-04-10',
    time: '10:00 AM',
    location: 'Conference Hall',
    type: 'Symposium',
    description: 'Interdisciplinary research presentations and collaborative discussions',
    attendees: 200,
    status: 'upcoming'
  },
  {
    id: 4,
    title: 'Industry Connect',
    date: '2024-01-20',
    time: '15:00 PM',
    location: 'Networking Lounge',
    type: 'Networking',
    description: 'Connecting researchers with industry leaders and potential collaborators',
    attendees: 150,
    status: 'completed'
  }
];

export default function EventsSection() {
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'completed');

  return (
    <section id="events" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 gradient-text">
            Events & Programs
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Fostering collaboration through conferences, workshops, and networking events
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-12">Upcoming Events</h3>
          <div className="space-y-8">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className="sleek-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        event.type === 'Conference' ? 'bg-purple-600 text-white' :
                        event.type === 'Workshop' ? 'bg-blue-600 text-white' :
                        event.type === 'Symposium' ? 'bg-green-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {event.type}
                      </span>
                      <h4 className="text-2xl font-bold text-white">{event.title}</h4>
                    </div>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">{event.description}</p>
                    <div className="flex flex-wrap gap-6 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} />
                        {event.attendees} participants
                      </div>
                    </div>
                  </div>
                  <button className="px-8 py-3 accent-gradient text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h3 className="text-3xl font-bold text-gray-400 mb-12">Past Events</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {pastEvents.map((event, index) => (
              <div
                key={event.id}
                className="sleek-card rounded-xl p-6 opacity-80 hover:opacity-100 transition-opacity duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                    {event.type}
                  </span>
                  <h4 className="font-bold text-white">{event.title}</h4>
                </div>
                <p className="text-gray-300 mb-4">{event.description}</p>
                <div className="text-sm text-gray-400">
                  {event.date} • {event.attendees} participants
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}