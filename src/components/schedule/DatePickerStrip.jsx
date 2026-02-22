import { useRef, useEffect } from "react";
import { motion } from "motion/react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * DatePickerStrip
 * Horizontal scrollable date picker for mobile.
 * Shows 30 days centered around today.
 *
 * Props:
 *  - selectedDate: Date
 *  - onSelect: (Date) => void
 */
export default function DatePickerStrip({ selectedDate, onSelect }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 60-day window: 14 days before today to 45 days after
  const dates = Array.from({ length: 60 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 14 + i);
    return d;
  });

  const stripRef = useRef(null);
  const todayIndex = 14; // today is at index 14

  // On mount, scroll today into center
  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current;
    const itemWidth = 56 + 8; // w-14 + gap-2
    const center = itemWidth * todayIndex - el.clientWidth / 2 + itemWidth / 2;
    el.scrollLeft = Math.max(0, center);
  }, []);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1"
      style={{ scrollBehavior: "smooth" }}
    >
      {dates.map((date, i) => {
        const isToday = isSameDay(date, today);
        const isSelected = isSameDay(date, selectedDate);
        const dayLabel = DAYS[date.getDay()];
        const dateNum = date.getDate();

        return (
          <motion.button
            key={i}
            onClick={() => onSelect(date)}
            whileTap={{ scale: 0.92 }}
            className={`
              flex-shrink-0 w-14 py-3 rounded-2xl flex flex-col items-center gap-1
              transition-all duration-200 border
              ${isSelected
                ? "bg-indigo-500 border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.4)]"
                : isToday
                  ? "bg-white/10 border-white/20"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/8 hover:border-white/10"
              }
            `}
          >
            <span className={`text-[10px] font-black uppercase tracking-widest
              ${isSelected ? "text-white/70" : "text-white/30"}`}>
              {dayLabel}
            </span>
            <span className={`text-base font-black leading-none
              ${isSelected ? "text-white" : isToday ? "text-white" : "text-white/60"}`}>
              {dateNum}
            </span>
            {/* Today dot */}
            {isToday && !isSelected && (
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}