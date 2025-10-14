'use client';

import { useMemo, useState, useEffect } from 'react';
import { IEvents } from '@/models/event_model';
import DockNavigation from '@/components/DockNavigation';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function EventsPage() {
  const [events, setEvents] = useState<(IEvents & { createdAt: string })[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<(IEvents & { createdAt: string }) | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const eventsData = await response.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = new Date(a.date_event as unknown as string).getTime();
      const db = new Date(b.date_event as unknown as string).getTime();
      return da - db;
    });
  }, [events]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, (IEvents & { createdAt: string })[]>();
    for (const ev of events) {
      const d = new Date(ev.date_event as unknown as string);
      if (!isNaN(d.getTime())) {
        const key = d.toDateString();
        const list = map.get(key) ?? [];
        list.push(ev);
        map.set(key, list);
      }
    }
    return map;
  }, [events]);

  const currentMonthEvents = useMemo(() => {
    const now = new Date();
    return [...events].filter((ev) => {
      const eventDate = new Date(ev.date_event as unknown as string);
      return (
        eventDate.getMonth() === now.getMonth() && 
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate >= now // Only show events from today onwards
      );
    }).sort((a, b) => {
      const da = new Date(a.date_event as unknown as string).getTime();
      const db = new Date(b.date_event as unknown as string).getTime();
      return da - db;
    });
  }, [events]);

  function handleEventClick(ev: IEvents & { createdAt: string }) {
    const date = new Date(ev.date_event as unknown as string);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setActiveEvent(ev);
    setDialogOpen(true);
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function eventColorClasses(name: string) {
    const palette = [
      { bg: 'bg-blue-500/20', text: 'text-blue-300', selBg: 'bg-blue-600', selText: 'text-white' },
      { bg: 'bg-green-500/20', text: 'text-green-300', selBg: 'bg-green-600', selText: 'text-white' },
      { bg: 'bg-amber-500/20', text: 'text-amber-300', selBg: 'bg-amber-500', selText: 'text-black' },
      { bg: 'bg-violet-500/20', text: 'text-violet-300', selBg: 'bg-violet-600', selText: 'text-white' },
      { bg: 'bg-rose-500/20', text: 'text-rose-300', selBg: 'bg-rose-600', selText: 'text-white' },
      { bg: 'bg-cyan-500/20', text: 'text-cyan-300', selBg: 'bg-cyan-600', selText: 'text-white' },
      { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', selBg: 'bg-fuchsia-600', selText: 'text-white' },
      { bg: 'bg-lime-500/20', text: 'text-lime-300', selBg: 'bg-lime-500', selText: 'text-black' },
      { bg: 'bg-orange-500/20', text: 'text-orange-300', selBg: 'bg-orange-500', selText: 'text-black' },
      { bg: 'bg-sky-500/20', text: 'text-sky-300', selBg: 'bg-sky-600', selText: 'text-white' },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    const pick = Math.abs(hash) % palette.length;
    return palette[pick];
  }

  function handleDateSelect(date?: Date) {
    if (!date) {
      setSelectedDate(undefined);
      return;
    }
    setSelectedDate(date);
    const key = date.toDateString();
    const todays = eventsByDate.get(key) ?? [];
    if (todays.length > 0) {
      setActiveEvent(todays[0]);
      setDialogOpen(true);
    } else {
      setActiveEvent(null);
    }
  }

  return (
    <main className="relative min-h-screen">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse"></div>
        </div>
      )}
      <div className="absolute inset-0 hero-grid opacity-30"></div>
      <div className="relative container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold gradient-text mb-4">
            Events Calendar
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore events by date. Click a highlighted day to see details.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="sleek-card rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Calendar</div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            <div className="min-h-[28rem]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{
                  hasEvent: "relative",
                }}
                captionLayout="buttons"
                month={currentMonth}
                onMonthChange={(m) => m && setCurrentMonth(m)}
                showOutsideDays
                fixedWeeks
                className="p-6"
                classNames={{
                  months: "flex flex-col space-y-4",
                  head_cell:
                    "text-muted-foreground rounded-md font-medium text-sm text-center",
                  table: "w-full border-collapse",
                  head_row: "grid grid-cols-7",
                  row: "grid grid-cols-7 mt-2",
                  cell: "relative text-center text-sm p-0 overflow-hidden",
                  day: "w-full h-16 md:h-20 p-0 font-semibold aria-selected:opacity-100 hover:bg-white/5 rounded-lg",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-lg font-bold",
                  day_selected:
                    "rounded-xl bg-white text-black hover:bg-white focus:bg-white",
                  day_today:
                    "before:absolute before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:w-1 before:h-1 before:bg-blue-400 before:rounded-full",
                }}
                onDayClick={(date) => {
                  setSelectedDate(date);
                  const key = date.toDateString();
                  const todays = eventsByDate.get(key) ?? [];
                  if (todays.length > 0) {
                    const latest = todays.reduce((acc, cur) => {
                      const at = new Date(
                        (cur as any).createdAt ?? 0
                      ).getTime();
                      const bt = new Date(
                        (acc as any).createdAt ?? 0
                      ).getTime();
                      return at >= bt ? cur : acc;
                    }, todays[0]);
                    setActiveEvent(latest);
                    setDialogOpen(true);
                  }
                }}
                components={{
                  IconLeft: ({ ...props }) => (
                    <ChevronLeft className="h-4 w-4" />
                  ),
                  IconRight: ({ ...props }) => (
                    <ChevronRight className="h-4 w-4" />
                  ),
                  DayContent: ({ date }) => {
                    const key = date.toDateString();
                    const todaysEvents = eventsByDate.get(key) ?? [];
                    const isSelected = selectedDate
                      ? isSameDay(date, selectedDate)
                      : false;
                    return (
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="leading-none text-center">
                            {date.getDate()}
                          </span>
                        </div>
                        {todaysEvents.length > 0 ? (
                          <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 flex w-[60px] max-w-[60px] flex-col items-center space-y-0.5">
                            {todaysEvents.slice(0, 2).map((ev, i) => {
                              const c = eventColorClasses(ev.name);
                              const colorCls = isSelected
                                ? `${c.selBg} ${c.selText}`
                                : `${c.bg} ${c.text}`;
                              return (
                                <span
                                  key={i}
                                  title={ev.name}
                                  className={`w-full truncate whitespace-nowrap overflow-hidden text-ellipsis rounded px-1 text-[10px] leading-4 ${colorCls}`}
                                >
                                  {ev.name}
                                </span>
                              );
                            })}
                            {todaysEvents.length > 2 ? (
                              <span
                                className={`w-full rounded px-1 text-[10px] leading-4 ${
                                  isSelected
                                    ? "bg-black/10 text-black/70"
                                    : "bg-white/10 text-white/80"
                                }`}
                              >
                                +{todaysEvents.length - 2} more
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  },
                }}
              />
            </div>
          </div>

          <div className="sleek-card rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">All Events</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-2xl bg-gray-800/40 border border-gray-700/60 animate-pulse"
                  />
                ))}
              </div>
            ) : sortedEvents.length === 0 ? (
              <p className="text-gray-400">No events available.</p>
            ) : (
              <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
                {sortedEvents.map((ev, idx) => {
                  const d = new Date(ev.date_event as unknown as string);
                  const display = isNaN(d.getTime())
                    ? "Invalid date"
                    : d.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                  const color = eventColorClasses(ev.name);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleEventClick(ev)}
                      className="w-full text-left group rounded-2xl p-4 bg-gray-800/40 border border-gray-700/60 hover:border-blue-500/40 hover:bg-gray-800/60 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-semibold truncate flex items-center gap-2">
                          <span
                            className={`truncate max-w-[14rem] rounded px-2.5 py-1 text-sm font-medium ${color.bg} ${color.text}`}
                          >
                            {ev.name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          {display}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="col-span-full">
            <h2 className="text-2xl font-semibold mb-4">
              Upcoming Events this Month
            </h2>
            <div className="sleek-card rounded-3xl p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-2xl bg-gray-800/40 border border-gray-700/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : currentMonthEvents.length === 0 ? (
                <p className="text-gray-400">No upcoming events this month.</p>
              ) : (
                <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
                  {currentMonthEvents.map((ev, idx) => {
                    const d = new Date(ev.date_event as unknown as string);
                    const display = isNaN(d.getTime())
                      ? "Invalid date"
                      : d.toLocaleDateString("en-US", {
                          weekday: 'long',
                          month: "short",
                          day: "numeric",
                        });
                    const color = eventColorClasses(ev.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleEventClick(ev)}
                        className="w-full text-left group rounded-2xl p-4 bg-gray-800/40 border border-gray-700/60 hover:border-blue-500/40 hover:bg-gray-800/60 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-semibold truncate flex items-center gap-2">
                            <span
                              className={`truncate max-w-[14rem] rounded px-2.5 py-1 text-sm font-medium ${color.bg} ${color.text}`}
                            >
                              {ev.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {display}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DockNavigation />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeEvent?.name ?? "Event"}</DialogTitle>
            <DialogDescription>
              {activeEvent
                ? new Date(
                    activeEvent.date_event as unknown as string
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No event selected"}
            </DialogDescription>
          </DialogHeader>
          {activeEvent ? (
            <div
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: activeEvent.description }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
