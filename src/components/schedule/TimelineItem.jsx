import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

/* ─────────────────────────────────────────
   STATUS CONFIG — aligned with Prisma enum:
   pending | done | skipped
───────────────────────────────────────── */
const STATUS_CFG = {
  done:    { dot: "bg-green-400",  pulse: false, label: "Done",    labelColor: "text-green-400",  cardBg: "bg-white/[0.02]",                         titleColor: "text-white/30", lineColor: "bg-green-400/20",  lineThrough: true  },
  skipped: { dot: "bg-white/20",   pulse: false, label: "Skipped", labelColor: "text-white/20",   cardBg: "bg-white/[0.02]",                         titleColor: "text-white/20", lineColor: "bg-white/5",       lineThrough: true  },
  pending: { dot: "bg-white/20",   pulse: false, label: "Pending", labelColor: "text-white/25",   cardBg: "bg-white/[0.03]",                         titleColor: "text-white/70", lineColor: "bg-white/5",       lineThrough: false },
};

/* ─────────────────────────────────────────
   Active/in-progress indicator:
   If startTime <= now < endTime → treat visually as "in progress"
   (backend doesn't have ongoing, we infer it client-side)
───────────────────────────────────────── */
const isOngoing = (activity) => {
  if (activity.status !== "pending" || !activity.startTime || !activity.endTime) return false;
  const now   = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = activity.startTime.split(":").map(Number);
  const [eh, em] = activity.endTime.split(":").map(Number);
  return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
};

const ONGOING_CFG = {
  dot: "bg-indigo-400", pulse: true, label: "In Progress", labelColor: "text-indigo-400",
  cardBg: "bg-indigo-500/[0.08] border-indigo-500/20", titleColor: "text-white",
  lineColor: "bg-indigo-400/40", lineThrough: false,
};

const PRIORITY_ACCENT = { high: "bg-red-500/30", medium: "bg-yellow-500/20", low: null };

/* ─────────────────────────────────────────
   TimelineItem
   Props:
   - activity: backend shape — camelCase fields:
     { id, title, startTime, endTime, status, priority, linkUrl, description }
   - isLast, index, onClick, onEdit, onDelete
───────────────────────────────────────── */
export default function TimelineItem({ activity, isLast = false, index = 0, onClick, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Determine visual config — ongoing is inferred client-side
  const ongoing = isOngoing(activity);
  const s       = ongoing ? ONGOING_CFG : (STATUS_CFG[activity.status] ?? STATUS_CFG.pending);
  const accent  = PRIORITY_ACCENT[activity.priority];
  const hasLink = !!activity.linkUrl;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Duration calc — camelCase
  const duration = (() => {
    if (!activity.startTime || !activity.endTime) return null;
    const [sh, sm] = activity.startTime.split(":").map(Number);
    const [eh, em] = activity.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07, ease: "easeOut" }}
      className="flex gap-4 group"
    >
      {/* Time column — camelCase */}
      <div className="w-12 shrink-0 text-right pt-3">
        <span className="text-[10px] font-black text-white/30 tracking-tighter leading-none">
          {activity.startTime}
        </span>
      </div>

      {/* Dot + connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative mt-3">
          {s.pulse && <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-50" />}
          <div className={`w-3 h-3 rounded-full border-2 border-[#0B1220] z-10 relative ${s.dot}`} />
        </div>
        {!isLast && <div className={`w-px flex-1 mt-1 min-h-[2rem] ${s.lineColor}`} />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-5 min-w-0">
        <div
          onClick={onClick}
          className={`relative rounded-2xl border border-white/5 p-4 cursor-pointer transition-all duration-200 hover:border-white/15 hover:bg-white/5 ${s.cardBg}`}
        >
          {/* Priority accent bar — hide when done/skipped */}
          {accent && activity.status === "pending" && (
            <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${accent}`} />
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className={`text-sm font-bold leading-snug truncate ${s.titleColor} ${s.lineThrough ? "line-through" : ""}`}>
              {activity.title}
            </h4>

            <div className="flex items-center gap-1 shrink-0">
              {/* Link button — camelCase linkUrl */}
              {hasLink && (
                <motion.a
                  href={activity.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                    ${ongoing
                      ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                      : "bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/65"
                    }`}
                >
                  <ExternalLink size={12} />
                </motion.a>
              )}

              {/* Context menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal size={14} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -6 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      exit={{ opacity: 0,   scale: 0.92, y: -6 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-8 z-20 w-36 bg-[#0d1828] border border-white/10 rounded-2xl shadow-xl shadow-black/60 overflow-hidden py-1.5"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-white/55 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Pencil size={12} className="text-white/30" /> Edit
                      </button>
                      <div className="mx-3 h-px bg-white/5 my-0.5" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium text-white/20">
              {activity.startTime} — {activity.endTime ?? "—"}
            </span>
            {duration && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-[10px] font-bold text-white/20">{duration}</span>
              </>
            )}
            <span className="text-white/10">·</span>
            <span className={`text-[10px] font-black flex items-center gap-1 ${s.labelColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
              {s.label}
            </span>
            {hasLink && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-[10px] text-white/20 flex items-center gap-0.5">
                  <ExternalLink size={8} /> link
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}