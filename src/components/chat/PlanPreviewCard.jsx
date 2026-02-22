import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2, Check, ChevronDown, CheckSquare,
  Calendar, ExternalLink, Zap, CalendarDays, AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────
   Design tokens
───────────────────────────────────────── */
const PRIORITY_CFG = {
  high:   { label: "Tinggi", dot: "bg-red-400",    text: "text-red-400",    activeBg: "bg-red-500/15",    activeBorder: "border-red-500/25"    },
  medium: { label: "Sedang", dot: "bg-yellow-400", text: "text-yellow-400", activeBg: "bg-yellow-500/15", activeBorder: "border-yellow-500/25" },
  low:    { label: "Rendah", dot: "bg-white/30",   text: "text-white/35",   activeBg: "bg-white/8",       activeBorder: "border-white/15"      },
};

const TYPE_CFG = {
  task:     { icon: CheckSquare, label: "Tugas",  color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  schedule: { icon: Calendar,    label: "Jadwal", color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

// Backend date may be ISO DateTime string "2026-02-22T00:00:00.000Z" or plain "YYYY-MM-DD"
const toDateInput = (val) => {
  if (!val) return "";
  return String(val).slice(0, 10); // safe for both formats
};

const formatDateID = (val) => {
  const iso = toDateInput(val);
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
  });
};

const calcDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}j${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

/* ─────────────────────────────────────────
   Normalize backend activity → internal UI shape
   Backend (camelCase): { title, type, date, startTime, endTime, priority, linkUrl, description, status }
   UI adds: _id (stripped before onSave)
───────────────────────────────────────── */
const normalizeActivity = (a, i, messageId) => ({
  _id:         `${messageId}-a${i}`,
  title:       a.title        ?? "",
  description: a.description  ?? null,
  type:        a.type         ?? "task",
  date:        toDateInput(a.date),
  startTime:   a.startTime    ?? null,
  endTime:     a.endTime      ?? null,
  priority:    a.priority     ?? null,
  linkUrl:     a.linkUrl      ?? null,
  status:      a.status       ?? "pending",
});

/* ─────────────────────────────────────────
   Single editable activity row
   All fields use camelCase matching backend schema
───────────────────────────────────────── */
function ActivityRow({ activity, index, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const t       = TYPE_CFG[activity.type] ?? TYPE_CFG.task;
  const TypeIcon = t.icon;
  const duration = calcDuration(activity.startTime, activity.endTime);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.26, delay: index * 0.05 }}
      className="group rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden"
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* Type icon */}
        <div className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${t.bg} border ${t.border}`}>
          <TypeIcon size={11} className={t.color} />
        </div>

        {/* Title & Date */}
        <div className="flex-1 min-w-[120px] flex flex-col pt-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays size={9} className="text-white/20" />
            <span className="text-[9px] font-black text-white/25 uppercase tracking-wider">
              {formatDateID(activity.date)}
            </span>
          </div>
          <input
            type="text"
            value={activity.title}
            onChange={(e) => onChange({ ...activity, title: e.target.value })}
            className="w-full bg-transparent text-sm font-black text-white/85
                       outline-none border-b border-transparent focus:border-indigo-500/30
                       transition-colors pb-0.5 placeholder:text-white/20"
            placeholder="Aktivitas..."
          />
        </div>

        {/* startTime — endTime */}
        <div className="flex items-center gap-1 shrink-0 bg-white/5 md:bg-transparent px-2 py-1 rounded-lg md:p-0">
          <input
            type="time"
            value={activity.startTime ?? ""}
            onChange={(e) => onChange({ ...activity, startTime: e.target.value || null })}
            className="bg-transparent outline-none text-[11px] font-black text-white/35
                       hover:text-white/65 focus:text-white transition-colors w-[3.5rem] md:w-[4rem] text-right"
          />
          <span className="text-white/15 text-[10px]">—</span>
          <input
            type="time"
            value={activity.endTime ?? ""}
            onChange={(e) => onChange({ ...activity, endTime: e.target.value || null })}
            className="bg-transparent outline-none text-[11px] font-black text-white/35
                       hover:text-white/65 focus:text-white transition-colors w-[3.5rem] md:w-[4rem]"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* linkUrl */}
          {activity.linkUrl && (
            <a
              href={activity.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20
                         hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              <ExternalLink size={11} />
            </a>
          )}

          {/* Expand */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/20
                       hover:text-white/50 hover:bg-white/5 transition-all"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} />
            </motion.div>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(activity._id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/10
                       hover:text-red-400 hover:bg-red-500/10 transition-all
                       opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* ── Expanded: date + duration + priority ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.05] flex items-center gap-4 flex-wrap">

              {/* date input */}
              <div className="flex items-center gap-1.5">
                <CalendarDays size={10} className="text-white/20" />
                <input
                  type="date"
                  value={activity.date}
                  onChange={(e) => onChange({ ...activity, date: e.target.value })}
                  className="bg-transparent text-[10px] font-bold text-white/35
                             outline-none hover:text-white/60 transition-colors"
                />
              </div>

              {/* Duration badge */}
              {duration && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400/60">
                  <Zap size={9} /> {duration}
                </div>
              )}

              {/* Priority selector */}
              <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end">
                <span className="text-[9px] text-white/20 font-black uppercase tracking-wider">
                  Prioritas:
                </span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {Object.entries(PRIORITY_CFG).map(([key, cfg]) => {
                    const isActive = activity.priority === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onChange({ ...activity, priority: key })}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black
                                    uppercase tracking-wider border transition-all
                          ${isActive
                            ? `${cfg.activeBg} ${cfg.text} ${cfg.activeBorder}`
                            : "bg-transparent border-transparent text-white/20 hover:text-white/40"
                          }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   PlanPreviewCard

   Receives raw backend response (camelCase):
   {
     type: "activity" | "note" | "none",
     message: string,
     warnings: string[],
     activities: Activity[],   ← camelCase fields
     notes: Note[],
   }

   Props:
   - planData: object (backend response)
   - messageId: string
   - onSave: (activities, notes) => void  ← stripped _id, ready for API
   - onRevise: () => void
═══════════════════════════════════════════════════ */
export default function PlanPreviewCard({ planData, messageId, onSave, onRevise }) {
  const [activities, setActivities] = useState(() =>
    (planData.activities ?? []).map((a, i) => normalizeActivity(a, i, messageId))
  );
  const [saved, setSaved] = useState(false);

  // Derive display state from backend "type"
  const hasActivities = activities.length > 0;
  const hasNotes      = (planData.notes ?? []).length > 0;
  const hasWarnings   = (planData.warnings ?? []).length > 0;

  const handleChange = (updated) =>
    setActivities((prev) => prev.map((a) => a._id === updated._id ? updated : a));

  const handleDelete = (id) =>
    setActivities((prev) => prev.filter((a) => a._id !== id));

  const handleSave = () => {
    setSaved(true);
    // Strip internal _id — send clean camelCase objects back to parent
    const clean = activities.map(({ _id, ...rest }) => rest);
    onSave?.(clean, planData.notes ?? []);
  };

  /* ── type: "none" — warning only ── */
  if (planData.type === "none" || (!hasActivities && !hasNotes && hasWarnings)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-2"
      >
        {planData.warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-2xl
                                  bg-yellow-500/[0.08] border border-yellow-500/15">
            <AlertTriangle size={12} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-yellow-400/80 font-medium leading-relaxed">{w}</p>
          </div>
        ))}
      </motion.div>
    );
  }

  /* ── type: "note" — note card only ── */
  if (planData.type === "note" || (!hasActivities && hasNotes)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 space-y-2"
      >
        {planData.notes.map((note, i) => (
          <div key={i} className="px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/20 mb-1.5">
              Catatan dibuat
            </p>
            <p className="text-sm font-bold text-white/70 mb-0.5">{note.title}</p>
            <p className="text-xs text-white/40 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </motion.div>
    );
  }

  if (!hasActivities) return null;

  /* ── type: "activity" | "mixed" — full plan preview ── */

  // Use first activity's date as the card header date
  const headerDate = activities[0]?.date ?? planData.activities?.[0]?.date ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="mt-3 rounded-3xl bg-[#0a1628] border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/50"
    >
      {/* Card header — simplified */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-0.5">
            Rencana Terdeteksi
          </p>
          <div className="flex items-center gap-2">
            <CheckSquare size={12} className="text-indigo-400" />
            <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">Plan Preview</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400">
            {activities.length} item
          </span>
        </div>
      </div>

      {/* Activity rows */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, i) => (
            <ActivityRow
              key={activity._id}
              activity={activity}
              index={i}
              onChange={handleChange}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5 text-xs text-white/20 font-medium"
          >
            Semua aktivitas dihapus.
          </motion.p>
        )}
      </div>

      {/* Inline warnings */}
      {hasWarnings && (
        <div className="px-4 pb-2 space-y-1.5">
          {planData.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl
                                    bg-yellow-500/[0.07] border border-yellow-500/15">
              <AlertTriangle size={10} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-400/80 font-medium leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-5 pt-3">
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl
                         bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-black"
            >
              <Check size={13} /> Rencana siap disimpan!
            </motion.div>
          ) : (
            <motion.div key="actions" className="flex items-center gap-3">
              <motion.button
                onClick={handleSave}
                disabled={activities.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-500 text-white text-xs font-black
                           uppercase tracking-wider
                           disabled:opacity-30 disabled:cursor-not-allowed
                           shadow-[0_0_20px_rgba(99,102,241,0.28)]
                           hover:shadow-[0_0_28px_rgba(99,102,241,0.48)]
                           transition-all"
              >
                Simpan ke Jadwal
              </motion.button>
              <button
                onClick={onRevise}
                className="px-4 py-3.5 rounded-2xl text-xs font-bold text-white/30
                           hover:text-white/55 hover:bg-white/5 transition-all whitespace-nowrap"
              >
                Ubah Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}