'use client';

import { useMemo, useState, useEffect } from 'react';
import { IEvents } from '@/models/event_model';
import DockNavigation from '@/components/DockNavigation';
import { Calendar } from '@/components/ui/calendar';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function EventsPage() {
  const [events, setEvents] = useState<(IEvents & { createdAt: string })[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const eventsData = await response.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const eventDates = useMemo(() => {
    return events
      .map((e) => new Date(e.date_event as unknown as string))
      .filter((d) => !isNaN(d.getTime()));
  }, [events]);

  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [] as (IEvents & { createdAt: string })[];
    return events.filter((e) => isSameDay(new Date(e.date_event as unknown as string), selectedDate));
  }, [events, selectedDate]);

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      <div className="relative container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold gradient-text mb-4">Events Calendar</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore events by date. Click a highlighted day to see details.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="sleek-card rounded-3xl p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent:
                  "relative after:content-['●'] after:text-blue-400 after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2",
              }}
              captionLayout="buttons"
              defaultMonth={selectedDate}
            />
          </div>

          <div className="space-y-4">
            <div className="sleek-card rounded-3xl p-6">
              <h2 className="text-2xl font-semibold mb-2">{selectedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              {eventsForSelectedDay.length === 0 ? (
                <p className="text-gray-400">No events on this day.</p>
              ) : (
                <div className="space-y-4">
                  {eventsForSelectedDay.map((event, idx) => (
                    <div key={idx} className="group relative rounded-2xl p-5 bg-gray-800/40 border border-gray-700/60 hover:border-blue-500/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                          <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: event.description }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DockNavigation />
    </main>
  );
}
