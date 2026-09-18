import type { CalendarEvent } from "../services/apple-calendar.service";
import dayjs from "dayjs";
import { capitalizeFirstLetter } from "../util/stringutils";

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
        <p className="text-red-800">Fel vid inläsning av händelser: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Laddar händelser...</div>
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
            {dayjs(selectedDate).format("D ")}
            {capitalizeFirstLetter(dayjs(selectedDate).format("MMMM"))}
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
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="break-words font-semibold text-gray-900">
                  {event.title}
                </h4>

                <div className="mt-1 flex items-center gap-2 text-lg text-gray-600">
                  <span>
                    {event.isAllDay
                      ? "Hela dagen"
                      : `${dayjs(event.start).format("HH:mm")} - ${dayjs(event.end).format("HH:mm")}`}
                  </span>
                </div>

                {event.location && (
                  <p className="mt-2 max-w-full break-all text-lg text-gray-600 whitespace-pre-wrap">
                    <span className="font-medium">Plats:</span> {event.location}
                  </p>
                )}

                {event.description && (
                  <p className="mt-2 max-w-full break-all overflow-hidden text-lg text-gray-600 whitespace-pre-wrap">
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
