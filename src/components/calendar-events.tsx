import type { CalendarEvent } from "../services/apple-calendar.service";
import dayjs from "dayjs";

interface CalendarEventsProps {
  events: CalendarEvent[];
  isLoading?: boolean;
  error?: string | null;
  selectedDate?: Date;
}

export function CalendarEvents({
  events,
  isLoading = false,
  error = null,
  selectedDate,
}: CalendarEventsProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading calendar: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading calendar events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Inga händelser idag</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        {selectedDate && (
          <h2 className="text-xl font-bold text-gray-900">
            {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
          </h2>
        )}
        <p className="text-sm text-gray-500 mt-1">{events.length} händelser</p>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border-l-4 border-secondary rounded shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start text-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-2xl">{event.title}</h4>

                <div className="flex items-center gap-2 text-md text-gray-600 mt-1">
                  <span>
                    {event.isAllDay
                      ? "All day"
                      : `${dayjs(event.start).format("HH:mm")} - ${dayjs(event.end).format("HH:mm")}`}
                  </span>
                </div>

                {event.location && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Plats:</span> {event.location}
                  </p>
                )}

                {event.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
