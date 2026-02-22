import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/**
 * MiniCalendar
 * Desktop month-view calendar grid.
 *
 * Props:
 *  - selectedDate: Date
 *  - onSelect: (Date) => void
 *  - activityDates: string[] — ISO date strings that have activities (dots)
 */
export default function MiniCalendar({ selectedDate, onSelect, activityDates = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const prevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const nextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  // Build grid: fill leading/trailing blanks
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
      return d;
    }),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const hasActivity = (date) => {
    if (!date) return false;
    const iso = date.toISOString().split("T")[0];
    return activityDates.includes(iso);
  };

  return (
    <div className="select-none">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-white/60">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-white/20 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasAct = hasActivity(date);
          const isPast = date < today && !isToday;

          return (
            <motion.button
              key={i}
              onClick={() => onSelect(date)}
              whileTap={{ scale: 0.88 }}
              className={`
                relative mx-auto w-8 h-8 rounded-xl flex flex-col items-center justify-center
                transition-all duration-150 text-xs font-bold
                ${isSelected
                  ? "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  : isToday
                    ? "bg-white/10 text-white"
                    : isPast
                      ? "text-white/20 hover:bg-white/5 hover:text-white/40"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {date.getDate()}
              {/* Activity dot */}
              {hasAct && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}