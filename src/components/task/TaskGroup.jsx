import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import TaskItem from "./TaskItem";

/**
 * TaskGroup
 * Collapsible section containing a list of tasks.
 *
 * Props:
 *  - label: string — section title (e.g. "Ongoing")
 *  - tasks: Task[]
 *  - onToggle: (id) => void
 *  - onDelete: (id) => void
 *  - defaultOpen: boolean
 *  - accentColor: string — tailwind text color class
 */
export default function TaskGroup({
  label,
  tasks = [],
  onToggle,
  onDelete,
  defaultOpen = true,
  accentColor = "text-white/40",
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (tasks.length === 0) return null;

  return (
    <div>
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 mb-3 group w-full"
      >
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentColor}`}>
          {label}
        </span>
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/5 ${accentColor}`}>
          {tasks.length}
        </span>
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className={`ml-auto ${accentColor} opacity-40 group-hover:opacity-70 transition-opacity`}
        >
          <ChevronDown size={13} />
        </motion.div>
      </button>

      {/* Tasks list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div className="space-y-2 pb-1">
              <AnimatePresence mode="popLayout">
                {tasks.map((task, i) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={i}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}