import { useMemo, useState, useEffect } from "react";
import "dayjs/locale/sv";
import dayjs, { Dayjs } from "dayjs";
import { useAppleCalendar } from "./hooks/useAppleCalendar";
import { capitalizeFirstLetter } from "./util/stringutils";

dayjs.locale("sv");

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

function getCalendarDays(month: Dayjs): Dayjs[] {
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const startOffset = (startOfMonth.day() + 6) % 7;
  const daysInMonth = endOfMonth.date();
  const totalDays = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const firstDay = startOfMonth.subtract(startOffset, "day");

  return Array.from({ length: totalDays }, (_, index) =>
    firstDay.add(index, "day"),
  );
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

  const dayEvents = events.filter(
    (event) =>
      dayjs(event.start).format("YYYY-MM-DD") === date.format("YYYY-MM-DD"),
  );

  const displayedEvents = dayEvents.slice(0, 2);
  const moreCount = dayEvents.length - displayedEvents.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={[
        "relative min-h-0 min-w-0 border-r border-b border-[#dfe5e2] p-2 text-left transition-colors",
        "bg-[#fdfaf7] hover:bg-[#f4f7f6] focus:z-10 focus:outline-none select-none",
        !isCurrentMonth ? "bg-[#f4f2ef] text-[#b6beb9]" : "",
        isSelected ? "bg-[#eaf6f5] ring-1 ring-inset ring-[#4b9ea4]" : "",
      ].join(" ")}
    >
      <div className="relative h-full w-full">
        <div className="absolute left-0 top-0 z-10">
          <span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-medium",
              isToday ? "bg-[#ffb000] text-white" : "",
              isSelected && !isToday ? "font-semibold text-[#1f4c4f]" : "",
              isWeekend && !isToday ? "text-[#e35c60]" : "",
            ].join(" ")}
          >
            {date.date()}
          </span>
        </div>

        {displayedEvents.length > 0 && (
          <div className="flex flex-col gap-1 overflow-hidden pt-8">
            {displayedEvents.map((event) => (
              <div
                key={event.id}
                className="truncate rounded-md bg-[#2ca7a4] px-2 py-1 text-[20px] font-medium text-white shadow-sm"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {moreCount > 0 && (
              <div className="pb-1 text-[11px] text-[#4d7d7c]">
                +{moreCount} till
              </div>
            )}
          </div>
        )}
      </div>
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

  const previousMonth = () =>
    setCurrentMonth((month) => month.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((month) => month.add(1, "month"));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between pb-4 select-none">
        <h1 className="text-[58px] font-black leading-none tracking-[-0.05em] text-[#1d2d2d]">
          {capitalizeFirstLetter(currentMonth.format("MMMM YYYY"))}
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dfe3df] bg-[#f8f5f2] text-3xl text-[#2f3c3b] shadow-sm"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dfe3df] bg-[#f8f5f2] text-3xl text-[#2f3c3b] shadow-sm"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-2xl bg-[#f5f5f2]">
        <div
          className="grid shrink-0 bg-[#f7f4f1] select-none"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-r border-b border-[#dfe5e2] px-3 py-2 text-center text-[14px] font-semibold uppercase tracking-[0.16em] text-[#697876] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="grid h-full min-h-0 flex-1"
          style={{
            gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))`,
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
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

const mockStats = [
  {
    label: "Inomhustemperatur",
    value: "21.4°C",
    status: "Normal",
    type: "temp",
  },
  { label: "Luftfuktighet", value: "42%", status: "Normal", type: "humidity" },
  {
    label: "Utomhusstemperatur",
    value: "13°C",
    status: "Delvis molnigt",
    type: "outside",
  },
  {
    label: "Energiförbrukning",
    value: "18.6 kWh",
    sub: "Idag",
    type: "energy",
  },
];

const upcomingEvents = [
  { time: "19 sep 13:00", title: "Svampens dag green" },
  { time: "20 sep 15:00", title: "Svampens dag på torget" },
  { time: "22 sep 09:00", title: "Målning hall" },
  { time: "29 sep 10:00", title: "Svalesmöte" },
];

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 10.5 12 4l8 6.5V18a1.5 1.5 0 0 1-1.5 1.5h-3.75A1.75 1.75 0 0 1 12.99 18v-4.25h-1.98V18a1.75 1.75 0 0 1-1.76 1.75H5.5A1.5 1.5 0 0 1 4 18v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 19.5V13h6v6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SyncIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 12a8 8 0 0 1-13.66 5.66M4 12a8 8 0 0 1 13.66-5.66"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4v5h5M20 20v-5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpdatedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 12.2 2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EventIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.5 13.2h2.5M13 13.2h2.5M8.5 17h4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({ item }: { item: (typeof mockStats)[number] }) {
  const icon =
    item.type === "temp"
      ? "◔"
      : item.type === "humidity"
        ? "◌"
        : item.type === "outside"
          ? "☼"
          : "▤";

  return (
    <div className="rounded-2xl border border-[#e7e1db] bg-[#f9f7f5] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f6] text-[28px] text-[#2e918d]">
          {icon}
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7a8a87]">
          {item.type === "energy" ? "" : ""}
        </div>
      </div>

      <div className="text-[14px] font-medium text-[#667978]">{item.label}</div>
      <div className="mt-2 text-[28px] font-bold tracking-[-0.05em] text-[#1d2d2d]">
        {item.value}
      </div>
      {item.sub ? (
        <div className="mt-2 text-[12px] text-[#6d7f7a]">{item.sub}</div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[#64726f]">
          <span className="h-2 w-2 rounded-full bg-[#b7c0bc]" />
          {item.status}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [hasInitialSync, setHasInitialSync] = useState(false);

  const dateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().add(3, "months").endOf("month").toDate(),
    }),
    [],
  );

  const { events, isLoading, isConfigured, lastSyncTime, configure, sync } =
    useAppleCalendar({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      autoSync: true,
      syncInterval: 5 * 60 * 1000,
    });

  useEffect(() => {
    if (!isConfigured) {
      const caldavUrl =
        "https://p175-caldav.icloud.com/published/2/NTU0NjA0NTc4NTU0NjA0Nccf8d7_mvqEcSGzxpbr7EV08Iuld-5uOEZgHXUHRqKIWwEvQORwx_pOdzEO8Yt_rvGqrKnRQ5uD5WvC5ww9IBo";
      configure(caldavUrl, "", "");
      return;
    }

    if (hasInitialSync) return;

    setHasInitialSync(true);
    void sync();
  }, [isConfigured, configure, sync, hasInitialSync]);

  const formattedLastSync = lastSyncTime
    ? dayjs(lastSyncTime).format("HH:mm")
    : "--:--";

  return (
    <div className="min-h-screen bg-[#f5f1ed] text-[#1c2d2d]">
      <header className="flex items-center justify-between border-b border-[#e3ddd7] bg-[#f5f1ed] px-5 py-4">
        <div className="flex items-center gap-3 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f3f0] text-[#1d2d2d] shadow-sm">
            <HomeIcon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.04em]">
            <span>Drömhem 2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[14px] text-[#465d5c]">
          <div className="flex items-center gap-2 font-medium">
            <SyncIcon className="h-4 w-4 text-[#405d5d]" />
            <span>Synk:</span>
            <span className="font-semibold text-[#1d2d2d]">
              {formattedLastSync}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#2d4f4c]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#a7b7b3] bg-[#eef5f2] text-[#2b746d]">
              <UpdatedIcon className="h-3.5 w-3.5" />
            </span>
            <span>Allt uppdaterat</span>
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#dfe6e2] bg-[#f8f5f2] px-4 py-2 font-medium text-[#2a3e3d] shadow-sm"
          >
            Inställningar
          </button>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-77px)] gap-6 p-5">
        <section className="flex-1 rounded-3xl bg-[#f5f1ed] p-4">
          {isLoading && events.length === 0 ? (
            <div className="flex h-full min-h-[620px] items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-[#dfe5e2] bg-white/75 px-5 py-3 shadow-sm backdrop-blur-sm">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#bfdbd7] border-t-[#2da9a3]" />
                <span className="text-sm font-medium text-[#355b5a]">
                  Synkar kalender…
                </span>
              </div>
            </div>
          ) : (
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              events={events}
            />
          )}
        </section>

        <aside className="w-[390px] shrink-0 rounded-3xl bg-[#f5f1ed] p-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {mockStats.map((item) => (
                <StatCard key={item.label} item={item} />
              ))}
            </div>

            <div className="rounded-2xl border border-[#dfe4e1] bg-[#f6f7f5] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#1d2d2d]">
                  Nästa
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium text-[#506a69]"
                >
                  Se alla ›
                </button>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((item) => (
                  <div
                    key={item.time}
                    className="flex items-center justify-between gap-3 border-b border-[#e7e1db] pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3f1] text-[#2e8c88]">
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[14px] text-[#5e7a78]">
                          {item.time}
                        </div>
                        <div className="text-[16px] font-medium text-[#1d2d2d]">
                          {item.title}
                        </div>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#6a7d7c]">›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
