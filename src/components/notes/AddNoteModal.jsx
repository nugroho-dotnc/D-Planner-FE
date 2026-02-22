import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Pin, CalendarDays, Database } from "lucide-react";

function FieldLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={10} className="text-white/25" />
      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">{children}</span>
    </div>
  );
}

const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5
  text-xs font-bold text-white/70 placeholder:text-white/20
  outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.04] transition-all`;

/**
 * AddNoteModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onAdd: ({ title, content, isPinned, relatedDate, source }) => void
 */
export default function AddNoteModal({ isOpen, onClose, onAdd }) {
  const [title,       setTitle]       = useState("");
  const [content,     setContent]     = useState("");
  const [isPinned,    setIsPinned]    = useState(false);
  const [relatedDate, setRelatedDate] = useState("");
  const [source,      setSource]      = useState("manual");

  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 150);
    } else {
      setTitle(""); setContent(""); setIsPinned(false);
      setRelatedDate(""); setSource("manual");
    }
  }, [isOpen]);

  const canSubmit = title.trim() && content.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      title:       title.trim(),
      content:     content.trim(),
      isPinned,
      relatedDate: relatedDate || null,
      source,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.metaKey) handleSubmit();
  };

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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm h-full"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0,  y: 28,  scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onKeyDown={handleKeyDown}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6
                       md:bottom-auto md:top-1/2 md:left-1/2
                       md:-translate-x-1/2 md:-translate-y-1/2
                       md:max-w-lg md:w-full md:pb-0 md:px-0"
          >
            <div className="bg-[#0d1828] border border-white/10 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">New Note</p>
                  <motion.button
                    onClick={() => setIsPinned((v) => !v)}
                    whileTap={{ scale: 0.9 }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border
                      ${isPinned 
                        ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" 
                        : "bg-white/5 border-white/5 text-white/20 hover:text-white/50"}`}
                  >
                    <Pin size={12} className={isPinned ? "rotate-45" : ""} />
                  </motion.button>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full bg-transparent border-b border-white/10 pb-2
                             text-base font-black text-white placeholder:text-white/20
                             outline-none focus:border-indigo-500/50 transition-all"
                />

                {/* Content */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={5}
                  className="w-full bg-transparent text-sm text-white/55 placeholder:text-white/15
                             outline-none resize-none leading-relaxed"
                />

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <FieldLabel icon={CalendarDays}>Related Date</FieldLabel>
                    <input
                      type="date"
                      value={relatedDate}
                      onChange={(e) => setRelatedDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Database}>Source</FieldLabel>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="manual" className="bg-[#0d1828]">Manual</option>
                      <option value="ai" className="bg-[#0d1828]">AI Generated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
                >
                  Cancel
                </button>

                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-500 text-white text-sm font-black
                             disabled:opacity-30 disabled:cursor-not-allowed
                             shadow-[0_0_20px_rgba(99,102,241,0.25)]
                             hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]
                             transition-all"
                >
                  Save Note
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
