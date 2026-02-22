import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flag, Clock, CalendarDays, Link2, AlignLeft, ChevronDown } from "lucide-react";

const PRIORITIES = ["high", "medium", "low"];
const PRIORITY_CONFIG = {
  high:   { label: "High",   text: "text-red-400",    border: "border-red-500/20",    activeBg: "bg-red-500/20" },
  medium: { label: "Medium", text: "text-yellow-400", border: "border-yellow-500/20", activeBg: "bg-yellow-500/20" },
  low:    { label: "Low",    text: "text-white/40",   border: "border-white/10",      activeBg: "bg-white/10" },
};

// Format Date → "YYYY-MM-DD" for input[type=date]
const toInputDate = (date) => date.toISOString().split("T")[0];

// Shared field label component
function FieldLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={10} className="text-white/25" />
      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">{children}</span>
    </div>
  );
}

// Shared text input style
const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5
  text-xs font-bold text-white/70 placeholder:text-white/20
  outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.04]
  transition-all`;

/**
 * AddActivityModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onAdd: (activity) => void
 *  - defaultDate: Date — pre-fills the date field
 */
export default function AddActivityModal({ isOpen, onClose, onAdd, defaultDate }) {
  const today = defaultDate ?? new Date();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState(toInputDate(today));
  const [startTime,   setStartTime]   = useState("");
  const [endTime,     setEndTime]     = useState("");
  const [priority,    setPriority]    = useState("medium");
  const [linkUrl,     setLinkUrl]     = useState("");
  const [showDesc,    setShowDesc]    = useState(false);
  const [showLink,    setShowLink]    = useState(false);
  const [linkError,   setLinkError]   = useState("");

  const titleRef = useRef(null);

  // Reset when opened / closed
  useEffect(() => {
    if (isOpen) {
      setDate(toInputDate(defaultDate ?? new Date()));
      setTimeout(() => titleRef.current?.focus(), 160);
    } else {
      setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
      setPriority("medium"); setLinkUrl(""); setShowDesc(false);
      setShowLink(false); setLinkError("");
    }
  }, [isOpen, defaultDate]);

  // Basic URL validation
  const validateUrl = (val) => {
    if (!val) return "";
    try { new URL(val); return ""; }
    catch { return "Enter a valid URL (include https://)"; }
  };

  const handleLinkChange = (val) => {
    setLinkUrl(val);
    setLinkError(val ? validateUrl(val) : "");
  };

  const canSubmit = title.trim() && startTime && !linkError;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      title:       title.trim(),
      description: description.trim() || null,
      date,
      startTime:   startTime,
      endTime:     endTime   || null,
      priority,
      linkUrl:     linkUrl.trim() || null,
      status:      "pending",
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.metaKey) handleSubmit();
    if (e.key === "Escape") onClose();
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6
                       md:bottom-auto md:top-1/2 md:left-1/2
                       md:-translate-x-1/2 md:-translate-y-1/2
                       md:max-w-lg md:w-full md:pb-0 md:px-0"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-[#0d1828] border border-white/10 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">

              {/* ── Sticky header ── */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <p className="text-xs font-black uppercase tracking-widest text-white/50">New Activity</p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Title */}
                <div>
                  <input
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity title..."
                    className="w-full bg-transparent border-0 border-b border-white/10
                               pb-2 text-base font-black text-white placeholder:text-white/20
                               outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {/* Date + Time row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <FieldLabel icon={CalendarDays}>Date</FieldLabel>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Clock}>Start</FieldLabel>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Clock}>End</FieldLabel>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <FieldLabel icon={Flag}>Priority</FieldLabel>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => {
                      const cfg = PRIORITY_CONFIG[p];
                      const isActive = priority === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-150
                            ${isActive
                              ? `${cfg.activeBg} ${cfg.text} ${cfg.border}`
                              : "bg-transparent border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                            }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional: Description */}
                <div>
                  <button
                    onClick={() => setShowDesc((v) => !v)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/25 hover:text-white/50 transition-colors"
                  >
                    <AlignLeft size={10} />
                    Add Description
                    <motion.div animate={{ rotate: showDesc ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={10} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showDesc && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add notes or details..."
                          rows={3}
                          className={`${inputCls} mt-2 resize-none`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Optional: Link */}
                <div>
                  <button
                    onClick={() => setShowLink((v) => !v)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/25 hover:text-white/50 transition-colors"
                  >
                    <Link2 size={10} />
                    Add Link
                    <motion.div animate={{ rotate: showLink ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={10} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showLink && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2">
                          <div className="relative">
                            <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                              type="url"
                              value={linkUrl}
                              onChange={(e) => handleLinkChange(e.target.value)}
                              placeholder="https://meet.google.com/..."
                              className={`${inputCls} pl-8 ${linkError ? "border-red-500/40" : ""}`}
                            />
                          </div>
                          {linkError && (
                            <p className="text-[10px] text-red-400 mt-1.5 ml-1">{linkError}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer actions ── */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-black
                             disabled:opacity-30 disabled:cursor-not-allowed
                             shadow-[0_0_20px_rgba(99,102,241,0.25)]
                             hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]
                             transition-all"
                >
                  Add Activity
                </motion.button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}