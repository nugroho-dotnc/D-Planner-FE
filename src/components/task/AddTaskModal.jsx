import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flag, Clock, CalendarDays } from "lucide-react";

const PRIORITIES = ["high", "medium", "low"];
const PRIORITY_CONFIG = {
  high:   { label: "High",   bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20",    activeBg: "bg-red-500/20" },
  medium: { label: "Medium", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", activeBg: "bg-yellow-500/20" },
  low:    { label: "Low",    bg: "bg-white/5",       text: "text-white/40",   border: "border-white/10",      activeBg: "bg-white/10" },
};

/**
 * AddTaskModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onAdd: ({ title, priority, due_time, deadline }) => void
 */
export default function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [title,    setTitle]    = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueTime,  setDueTime]  = useState("");
  const [deadline, setDeadline] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setTitle("");
      setPriority("medium");
      setDueTime("");
      setDeadline("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title:    title.trim(),
      priority,
      due_time: dueTime   || null,
      deadline: deadline  || null,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  // Shared input style
  const inputCls = "bg-white/5 border border-white/[0.08] rounded-xl text-[11px] font-bold text-white/60 outline-none focus:border-indigo-500/40 focus:bg-indigo-500/5 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel — slide up on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6
                       md:bottom-auto md:top-1/2 md:left-1/2
                       md:-translate-x-1/2 md:-translate-y-1/2
                       md:max-w-md md:w-full md:pb-0 md:px-0"
          >
            <div className="bg-[#0d1828] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/60">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-black uppercase tracking-widest text-white/50">New Task</p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Title */}
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="w-full bg-white/5 border border-white/[0.08] rounded-2xl px-4 py-3.5
                           text-sm font-bold text-white placeholder:text-white/20
                           outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5
                           transition-all mb-5"
              />

              {/* Priority */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Flag size={10} className="text-white/25" />
                  <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Priority</span>
                </div>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const isActive = priority === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`
                          flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider
                          transition-all duration-150
                          ${isActive
                            ? `${cfg.activeBg} ${cfg.text} ${cfg.border}`
                            : "bg-transparent border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                          }
                        `}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due time + Deadline — side by side */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock size={10} className="text-white/25" />
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Due Time</span>
                  </div>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className={`w-full px-3 py-2.5 ${inputCls}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarDays size={10} className="text-white/25" />
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Deadline</span>
                  </div>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full px-3 py-2.5 ${inputCls}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/8 text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-black
                             disabled:opacity-30 disabled:cursor-not-allowed
                             shadow-[0_0_20px_rgba(99,102,241,0.25)]
                             hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]
                             transition-all"
                >
                  Add Task
                </motion.button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}