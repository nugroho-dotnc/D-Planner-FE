import { motion } from "motion/react";
import { Pin, Trash2, Sparkles, Clock } from "lucide-react";

/**
 * NoteCard
 * Reusable glassmorphic card for notes.
 * 
 * Props:
 *  - note: { id, title, content, is_pinned, has_ai_summary, created_at, badge?, color? }
 *  - onTogglePin: (id) => void
 *  - onDelete: (id) => void
 */
export default function NoteCard({ note, onTogglePin, onDelete, isPinnedSection = false }) {
  const glowStyles = {
    yellow: "after:bg-yellow-500/10",
    blue: "after:bg-blue-500/10",
    indigo: "after:bg-indigo-500/10",
    purple: "after:bg-purple-500/10",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex flex-col p-5 rounded-[28px] border transition-all duration-300 overflow-hidden
        ${note.is_pinned 
          ? "bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
        } 
        ${note.color ? glowStyles[note.color] : ""}
        ${note.color ? "after:absolute after:inset-0 after:z-[-1] after:blur-3xl" : ""}
        ${isPinnedSection ? "md:p-6" : ""}`}
    >
      {/* Pinned Glow Indicator */}
      {note.is_pinned && (
        <div className="absolute top-0 left-0 w-1 h-full rounded-full bg-indigo-500/40" />
      )}

      {/* Header: Badge & Pin Action */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex flex-col gap-3">
          {note.badge && (
            <div className={`self-start px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
              note.badge === 'PENTING' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/30'
            }`}>
              {note.badge}
            </div>
          )}
          <h3 className={`font-bold leading-tight line-clamp-2 ${isPinnedSection ? "text-lg" : "text-sm"} text-white/90`}>
            {note.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded-lg transition-colors ${note.is_pinned ? "text-indigo-400 bg-indigo-400/10" : "text-white/20 hover:text-white/40 hover:bg-white/5"}`}
          >
            <Pin size={14} className={note.is_pinned ? "rotate-45" : ""} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <p className={`text-white/40 leading-relaxed mb-6 line-clamp-3 ${isPinnedSection ? "text-sm" : "text-xs"}`}>
        {note.content}
      </p>

      {/* Footer: Date & AI Status */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          <Clock size={10} />
          {note.created_at}
        </div>
        
        {note.has_ai_summary && (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400/60">
            <Sparkles size={10} />
            <span className="hidden sm:inline">AI Summary Ready</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
