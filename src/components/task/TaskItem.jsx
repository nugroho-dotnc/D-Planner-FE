import { motion, AnimatePresence } from "motion/react";
import { Trash2, Clock, CalendarDays } from "lucide-react";

const PRIORITY_CONFIG = {
  high:   { label: "High",   bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400",    border: "border-red-500/20" },
  medium: { label: "Med",    bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400", border: "border-yellow-500/20" },
  low:    { label: "Low",    bg: "bg-white/5",       text: "text-white/30",   dot: "bg-white/20",   border: "border-white/10" },
};

// Format "2026-02-25" → "Feb 25"
function formatDeadline(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Is deadline overdue?
function isOverdue(isoDate) {
  if (!isoDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(isoDate + "T00:00:00") < today;
}

/**
 * TaskItem
 * Props:
 *  - task: { id, title, priority, status, due_time?: string, deadline?: string }
 *  - onToggle: (id) => void
 *  - onDelete: (id) => void
 *  - index: number
 */
export default function TaskItem({ task, onToggle, onDelete, index = 0 }) {
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
  const isDone = task.status === "completed";
  const overdue = !isDone && isOverdue(task.deadline);
  const deadlineLabel = formatDeadline(task.deadline);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: "easeOut" }}
      className={`
        group flex items-start gap-3.5 px-4 py-3.5 rounded-2xl border
        transition-all duration-200
        ${isDone
          ? "bg-white/[0.02] border-white/5"
          : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/15"
        }
        ${overdue ? "border-red-500/20" : ""}
      `}
    >
      {/* Checkbox */}
      <motion.button
        onClick={() => onToggle(task.id)}
        whileTap={{ scale: 0.82 }}
        className={`
          shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center
          transition-all duration-300
          ${isDone
            ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.35)]"
            : "border-white/20 hover:border-indigo-400/60 bg-transparent"
          }
        `}
      >
        <AnimatePresence>
          {isDone && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.18, type: "spring", stiffness: 500 }}
              width="10" height="10" viewBox="0 0 10 10" fill="none"
            >
              <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className={`text-sm font-bold leading-snug transition-all duration-300
          ${isDone ? "text-white/25 line-through" : "text-white/85"}`}
        >
          {task.title}
        </p>

        {/* Meta: due_time + deadline */}
        {(task.due_time || task.deadline) && (
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {task.due_time && (
              <span className={`flex items-center gap-1 text-[10px] font-medium
                ${isDone ? "text-white/15" : "text-white/30"}`}
              >
                <Clock size={9} />
                {task.due_time}
              </span>
            )}
            {deadlineLabel && (
              <span className={`flex items-center gap-1 text-[10px] font-bold
                ${isDone
                  ? "text-white/15"
                  : overdue
                    ? "text-red-400"
                    : "text-white/30"
                }`}
              >
                <CalendarDays size={9} />
                {overdue && !isDone ? "Overdue · " : ""}{deadlineLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: priority badge + delete */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider
          ${p.bg} ${p.text} ${p.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </div>

        <motion.button
          onClick={() => onDelete(task.id)}
          whileTap={{ scale: 0.88 }}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}