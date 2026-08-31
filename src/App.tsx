// @ts-nocheck
import { useMemo, useState, useEffect } from "react";
import "dayjs/locale/sv";
import dayjs, { Dayjs } from "dayjs";
import { useAppleCalendar } from "./hooks/useAppleCalendar";
import { CalendarConfig } from "./components/calendar-config";
import { CalendarEvents } from "./components/calendar-events";

dayjs.locale("sv");

type Todo = {
  time: string;
  title: string;
};

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

function getTodoList(date: Dayjs): Todo[] {
  return [];
}

function getCalendarDays(month: Dayjs): Dayjs[] {
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");

  // Dayjs: Sunday = 0, Monday = 1, etc.
  // Convert to Monday-based index: Monday = 0, Sunday = 6.
  const startOffset = (startOfMonth.day() + 6) % 7;

  const daysInMonth = endOfMonth.date();

  // Always show complete weeks.
  const totalDays = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const firstDay = startOfMonth.subtract(startOffset, "day");

  return Array.from({ length: totalDays }, (_, index) =>
    firstDay.add(index, "day"),
  );n
}

type CalendarDayProps = {
  date: Dayjs;
  currentMonth: Dayjs;
  selectedDate: Dayjs | null;
  onSelect: (date: Dayjs) => void;
  events: Array<{ id: string; title: string; start: Date }>;
};

function CalendarDay({
  date,
  currentMonth,
  selectedDate,
  onSelect,
  events,
}: CalendarDayProps) {
  const isCurrentMonth = date.month() === currentMonth.month();
  const isToday = date.isSame(dayjs(), "day");
  const isSelected = selectedDate?.isSame(date, "day");
  const isWeekend = date.day() === 0;

  const todos = getTodoList(date);

  // Filter Apple Calendar events for this day
  const dayEvents = events.filter(
    (event) =>
      dayjs(event.start).format("YYYY-MM-DD") === date.format("YYYY-MM-DD"),
  );

  // Show max 4 events
  const displayedEvents = dayEvents.slice(0, 2);
  const moreCount = dayEvents.length - displayedEvents.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={`
        relative min-h-0 min-w-0
        border-r border-b border-gray-200
        bg-primary p-2 text-left
        transition-colors
        bg-white
        hover:bg-gray-50
        focus:z-10 focus:outline-none
        select-none
        ${!isCurrentMonth ? "bg-gray-50 text-gray-300" : ""}
        ${isSelected ? "ring-2 ring-inset ring-blue-500" : ""}
      `}
    >
      {/* Date number */}
      <div className="flex items-center absolute top-1">
        <span
          className={`
            flex h-8 w-8 items-center justify-center
            rounded-full text-lg
            ${isToday ? "bg-secondary font-semibold text-black" : ""}
            ${isSelected && !isToday ? "font-semibold text-blue-600" : ""}
            ${isWeekend && !isToday ? "text-red-600" : ""}
          `}
        >
          {date.date()}
        </span>
      </div>

      {/* Apple Calendar Events Pills */}
      {displayedEvents.length > 0 && (
        <div className="mt-6 space-y-1 overflow-hidden">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className="truncate rounded bg-accent px-2 py-0.5 text-white text-lg"
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          {moreCount > 0 && (
            <div className="text-xs text-gray-600 pb-2">+{moreCount} till</div>
          )}
        </div>
      )}
    </button>
  );
}

function Calendar({
  value,
  onChange,
  events = [],
}: {
  value: Dayjs;
  onChange: (date: Dayjs) => void;
  events?: Array<{ id: string; title: string; start: Date }>;
}) {
  const [currentMonth, setCurrentMonth] = useState(value.startOf("month"));

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const weeks = Math.ceil(days.length / 7);

  const previousMonth = () => {
    setCurrentMonth((month) => month.subtract(1, "month"));
  };

  const nextMonth = () => {
    setCurrentMonth((month) => month.add(1, "month"));
  };

  const goToToday = () => {
    const today = dayjs();

    setCurrentMonth(today.startOf("month"));
    onChange(today);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between pb-4 select-none">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {currentMonth.format("MMMM YYYY")}
          </h1>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-white"
          >
            Idag
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-9 w-9 items-center text-4xl justify-center rounded-md"
            aria-label="Previous month"
          >
            ←
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center text-4xl justify-center rounded-md"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex flex-col overflow-hidden rounded-lg w-fit">
        {/* Weekday header */}
        <div
          className="grid shrink-0 bg-accent select-none "
          style={{ gridTemplateColumns: "repeat(7, 12rem)" }}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-r border-b border-gray-200 px-3 py-2 text-center text-lg font-medium text-primary last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div
          className="grid"
          style={{
            gridTemplateRows: `repeat(${weeks}, 8.4rem)`,
            gridTemplateColumns: "repeat(7, 12rem)",
          }}
        >
          {days.map((date) => (
            <CalendarDay
              key={date.format("YYYY-MM-DD")}
              date={date}
              currentMonth={currentMonth}
              selectedDate={value}
              onSelect={onChange}
              events={events}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TodoList({ date }: { date: Dayjs | null }) {
  if (!date) {
    return <div className="p-6 text-gray-400">Select a date</div>;
  }

  const todos = getTodoList(date);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-gray-200 p-6 select-none">
        <div className="text-sm text-gray-500">{date.format("dddd")}</div>

        <div className="mt-1 text-2xl font-semibold">
          {date.format("MMMM D")}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto select-none">
        {todos.length === 0 ? (
          <div className="p-6 text-gray-400">Inga händelser idag</div>
        ) : (
          todos.map((todo, index) => (
            <div key={index} className="border-b border-gray-200 p-5">
              <div className="text-sm text-gray-500">{todo.time}</div>

              <div className="mt-1 font-medium">{todo.title}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showCalendarPanel, setShowCalendarPanel] = useState(true);

  // Memoize the date range to prevent re-renders
  const dateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().add(3, "months").endOf("month").toDate(),
    }),
    [], // Only compute once on mount
  );

  const { events, isLoading, error, isConfigured, configure, sync } =
    useAppleCalendar({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      autoSync: false, // Disabled auto-sync to prevent loops
      syncInterval: 10 * 60 * 1000, // Sync every 10 minutes
    });

  // Auto-configure with your calendar URL on mount
  useEffect(() => {
    if (!isConfigured) {
      // Convert webcal:// to https://
      const caldavUrl =
        "https://p175-caldav.icloud.com/published/2/NTU0NjA0NTc4NTU0NjA0Nccf8d7_mvqEcSGzxpbr7EV08Iuld-5uOEZgHXUHRqKIWwEvQORwx_pOdzEO8Yt_rvGqrKnRQ5uD5WvC5ww9IBo";
      // Use empty credentials for published calendars
      configure(caldavUrl, "", "");
    }
  }, [isConfigured, configure]);

  // Filter events to only show events for the selected date
  const todayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => {
      const eventDate = dayjs(event.start).format("YYYY-MM-DD");
      const selectedDateStr = selectedDate.format("YYYY-MM-DD");
      return eventDate === selectedDateStr;
    });
  }, [events, selectedDate]);

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col bg-primary">
      {/* Top Navigation */}
      <div className="border-b border-orange-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Drömhuset 2.0 ❤️</h1>
        <div className="flex items-center gap-4">
          {isConfigured && (
            <button
              onClick={sync}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-accent text-white rounded transition-colors"
            >
              {isLoading ? "Synkar..." : "Synka kalender"}
            </button>
          )}
        </div>
      </div>

      <div className="flex h-full min-h-0">
        {/* Main Calendar Section */}
        <div className={`w-full h-full min-h-0 bg-primary p-4 transition-all`}>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            events={events}
          />
        </div>

        {/* Apple Calendar Events Panel */}
        {showCalendarPanel && (
          <div className="w-1/2 h-full min-h-0 border-l border-orange-100 bg-primary p-4 overflow-y-auto">
            <CalendarEvents
              events={todayEvents}
              isLoading={isLoading}
              error={error}
              selectedDate={selectedDate.toDate()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
