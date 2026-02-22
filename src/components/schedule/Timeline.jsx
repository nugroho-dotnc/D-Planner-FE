import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import TimelineItem from "./TimelineItem";

/* ── Inline delete confirm ── */
function DeleteConfirm({ activity, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-8 md:pb-0"
    >
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{ opacity: 0,  y: 20,  scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative z-10 w-full max-w-sm bg-[#0d1828] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/70"
      >
        <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-sm font-black text-white text-center mb-1">Delete Activity?</h3>
        <p className="text-xs font-bold text-white/30 text-center mb-1 truncate px-4">"{activity?.title}"</p>
        <p className="text-[10px] text-white/20 text-center mb-5">This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all">
            Cancel
          </button>
          <motion.button onClick={onConfirm} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-black
                       shadow-[0_0_16px_rgba(239,68,68,0.2)] hover:shadow-[0_0_24px_rgba(239,68,68,0.35)] transition-all">
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Timeline
 * Props:
 *  - activities: array
 *  - onActivityClick:  (activity) => void  — opens detail page
 *  - onActivityEdit:   (activity) => void  — opens detail page in edit mode
 *  - onActivityDelete: (id) => void        — removes from state
 *  - onAdd: () => void
 *  - selectedDate: Date
 */
export default function Timeline({
  activities = [],
  onActivityClick,
  onActivityEdit,
  onActivityDelete,
  onAdd,
  selectedDate,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth()    === today.getMonth()    &&
    selectedDate.getDate()     === today.getDate();

  const dateLabel = isToday
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-0.5">Timeline</p>
            <h3 className="text-sm font-black text-white">{dateLabel}</h3>
          </div>
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-500/25 transition-all"
          >
            <Plus size={11} /> Add
          </motion.button>
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          {activities.length > 0 ? (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {activities.map((activity, i) => (
                <TimelineItem
                  key={activity.id}
                  activity={activity}
                  isLast={i === activities.length - 1}
                  index={i}
                  onClick={() => onActivityClick?.(activity)}
                  onEdit={() => onActivityEdit?.(activity)}
                  onDelete={() => setDeleteTarget(activity)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Calendar size={22} className="text-white/20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/30 mb-1">No activities</p>
                <p className="text-xs text-white/15">
                  {isToday ? "Your day is clear — add something!" : "Nothing planned for this day."}
                </p>
              </div>
              <motion.button
                onClick={onAdd}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all"
              >
                + Add Activity
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            activity={deleteTarget}
            onConfirm={() => { onActivityDelete?.(deleteTarget.id); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}