import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSWRConfig } from "swr";
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, Clock,
  CalendarDays, Flag, AlignLeft, Link2, Check, X, Zap,
} from "lucide-react";
import GlassCard from "../../components/cards/GlassCard";
import activityService from "../../services/app/activityService";

/* ─────────────────────────────────────────
   Design tokens — ALIGNED with Prisma enum
   ActivityStatus: pending | done | skipped
───────────────────────────────────────── */
const PRIORITIES = ["high", "medium", "low"];
const PRIORITY_CFG = {
  high:   { label: "High",   text: "text-red-400",    dot: "bg-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    active: "bg-red-500/20"    },
  medium: { label: "Medium", text: "text-yellow-400", dot: "bg-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", active: "bg-yellow-500/20" },
  low:    { label: "Low",    text: "text-white/40",   dot: "bg-white/30",   bg: "bg-white/5",       border: "border-white/10",      active: "bg-white/10"      },
};

// Backend enum: pending | done | skipped
const STATUSES = ["pending", "done", "skipped"];
const STATUS_CFG = {
  pending: { label: "Pending", dot: "bg-white/30",   text: "text-white/40",  bg: "bg-white/5",        border: "border-white/10",      pulse: false },
  done:    { label: "Done",    dot: "bg-green-400",  text: "text-green-400", bg: "bg-green-500/10",   border: "border-green-500/20",  pulse: false },
  skipped: { label: "Skipped", dot: "bg-white/20",   text: "text-white/25",  bg: "bg-white/[0.03]",   border: "border-white/[0.07]",  pulse: false },
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const calcDuration = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const dateStr = String(iso).split("T")[0];
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const validateUrl = (v) => {
  if (!v) return "";
  try { new URL(v); return ""; }
  catch { return "Enter a valid URL (include https://)"; }
};

/* ─────────────────────────────────────────
   Shared form styles
───────────────────────────────────────── */
const inputCls = `w-full bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5
  text-sm font-bold text-white/80 placeholder:text-white/20
  outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.04] transition-all`;

function FieldLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={10} className="text-white/25" />
      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">{children}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Delete confirm dialog
───────────────────────────────────────── */
function DeleteConfirm({ title, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
        className="relative z-10 w-full max-w-sm bg-[#0d1828] border border-white/10 rounded-3xl p-7 shadow-2xl shadow-black/70"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-base font-black text-white text-center mb-2">Delete Activity?</h3>
        <p className="text-xs font-bold text-white/35 text-center mb-1 px-2 truncate">"{title}"</p>
        <p className="text-[10px] text-white/20 text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm} whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black
                       shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_28px_rgba(239,68,68,0.4)] transition-all"
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   ActivityDetailPage
═══════════════════════════════════════ */
export default function ActivityDetail({
  activity: activityProp,
  initialMode = "view",
  onUpdate,
  onDelete,
  onBack,
}) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { mutate } = useSWRConfig();

  const routerActivity = location?.state?.activity;
  const routerMode     = location?.state?.mode ?? "view";

  const [activity,   setActivity]   = useState(activityProp ?? routerActivity ?? null);
  const [mode,       setMode]       = useState(initialMode  ?? routerMode);
  const [showDelete, setShowDelete] = useState(false);
  const [saveFlash,  setSaveFlash]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  // Edit form fields — all camelCase matching backend
  const [editTitle,       setEditTitle]       = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate,        setEditDate]        = useState("");
  const [editStartTime,   setEditStartTime]   = useState("");
  const [editEndTime,     setEditEndTime]     = useState("");
  const [editPriority,    setEditPriority]    = useState("medium");
  const [editStatus,      setEditStatus]      = useState("pending");
  const [editLinkUrl,     setEditLinkUrl]     = useState("");
  const [editLinkError,   setEditLinkError]   = useState("");

  const handleBack = onBack ?? (() => navigate(-1));

  // Fetch from API if activity not in state/props (e.g. direct URL access)
  useEffect(() => {
    if (activityProp) {
      setActivity(activityProp);
      return;
    }
    if (routerActivity) {
      setActivity(routerActivity);
      return;
    }
    // Fallback: fetch from API using URL param
    if (id) {
      setLoading(true);
      activityService.getOne(id)
        .then(setActivity)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activityProp, id]);

  // Populate edit fields when entering edit mode
  useEffect(() => {
    if (mode === "edit" && activity) {
      setEditTitle(activity.title ?? "");
      setEditDescription(activity.description ?? "");
      // date may be ISO DateTime "2026-02-22T00:00:00.000Z" — slice to YYYY-MM-DD
      setEditDate(activity.date ? String(activity.date).slice(0, 10) : "");
      setEditStartTime(activity.startTime ?? "");
      setEditEndTime(activity.endTime ?? "");
      setEditPriority(activity.priority ?? "medium");
      // Normalize: backend only has pending/done/skipped
      setEditStatus(STATUSES.includes(activity.status) ? activity.status : "pending");
      setEditLinkUrl(activity.linkUrl ?? "");
      setEditLinkError("");
    }
  }, [mode, activity]);

  const handleLinkChange = (v) => {
    setEditLinkUrl(v);
    setEditLinkError(v ? validateUrl(v) : "");
  };

  const canSave = editTitle.trim() && !editLinkError;

  const handleSave = async () => {
    if (!canSave) return;
    const payload = {
      title:       editTitle.trim(),
      description: editDescription.trim() || null,
      date:        editDate,
      startTime:   editStartTime || null,
      endTime:     editEndTime   || null,
      priority:    editPriority,
      status:      editStatus,
      linkUrl:     editLinkUrl.trim() || null,
    };

    try {
      const updated = await activityService.updateActivity(activity.id, payload);
      setActivity({ ...activity, ...payload, ...(updated ?? {}) });
      onUpdate?.({ ...activity, ...payload });
      mutate((key) => typeof key === "string" && key.includes("/api/activities"));
      setMode("view");
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2500);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /* Quick status — calls dedicated PATCH /status endpoint */
  const handleQuickStatus = async (st) => {
    if (!STATUSES.includes(st)) return;
    try {
      await activityService.updateStatus(activity.id, st);
      const updated = { ...activity, status: st };
      setActivity(updated);
      onUpdate?.(updated);
      mutate((key) => typeof key === "string" && key.includes("/api/activities"));
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await activityService.deleteActivity(activity.id);
      onDelete?.(activity.id);
      handleBack();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ── Loading / not found states ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-white/10 border-t-indigo-400 rounded-full"
        />
        <p className="text-xs text-white/25 font-medium">Loading activity...</p>
      </div>
    );
  }

  if (!activity) return null;

  const p  = PRIORITY_CFG[activity.priority] ?? PRIORITY_CFG.low;
  const s  = STATUS_CFG[activity.status]     ?? STATUS_CFG.pending;
  const duration  = calcDuration(activity.startTime, activity.endTime);
  const isEditing = mode === "edit";

  return (
    <>
      <motion.div
        className="pb-20 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {/* ── Top nav ── */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={handleBack}
            whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white/35 hover:text-white/80 transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Schedule</span>
          </motion.button>

          <div className="flex items-center gap-2">
            {/* Saved flash */}
            <AnimatePresence>
              {saveFlash && (
                <motion.span
                  initial={{ opacity: 0, x: 8, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1    }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black"
                >
                  <Check size={10} /> Saved
                </motion.span>
              )}
            </AnimatePresence>

            {!isEditing ? (
              <>
                <motion.button
                  onClick={() => setMode("edit")}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white/45 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 hover:text-white/70 transition-all"
                >
                  <Pencil size={11} /> Edit
                </motion.button>
                <motion.button
                  onClick={() => setShowDelete(true)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={11} /> Delete
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => setMode("view")} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-wider hover:bg-white/8 transition-all"
                >
                  <X size={11} /> Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={!canSave}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider
                             disabled:opacity-30 disabled:cursor-not-allowed
                             shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all"
                >
                  <Check size={11} /> Save
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* ── Content — view / edit ── */}
        <AnimatePresence mode="wait">

          {/* ══ VIEW MODE ══ */}
          {!isEditing && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* Hero */}
              <GlassCard className="!p-7">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
                    {s.label}
                  </span>
                  {activity.priority && (
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${p.bg} ${p.text} ${p.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-[2rem] font-black text-white tracking-tight leading-tight mb-7">
                  {activity.title}
                </h1>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CalendarDays size={10} className="text-white/25" />
                      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Date</span>
                    </div>
                    <p className="text-sm font-bold text-white/65 leading-snug">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Clock size={10} className="text-white/25" />
                      <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-sm font-bold text-white/65">
                      {activity.startTime ?? "—"}
                      {activity.endTime && (
                        <span className="text-white/30 font-normal"> — {activity.endTime}</span>
                      )}
                    </p>
                    {duration && (
                      <p className="text-[10px] font-bold text-indigo-400 mt-1 flex items-center gap-1">
                        <Zap size={9} /> {duration}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Description */}
              {activity.description && (
                <GlassCard className="!p-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <AlignLeft size={11} className="text-white/25" />
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Notes</span>
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">{activity.description}</p>
                </GlassCard>
              )}

              {/* Link */}
              {activity.linkUrl && (
                <GlassCard className="!p-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Link2 size={11} className="text-white/25" />
                    <span className="text-[10px] font-black text-white/25 uppercase tracking-wider">Link</span>
                  </div>
                  <a
                    href={activity.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl
                               bg-indigo-500/[0.07] border border-indigo-500/20
                               hover:bg-indigo-500/15 hover:border-indigo-500/35 transition-all"
                  >
                    <span className="text-sm font-bold text-indigo-400 truncate group-hover:text-indigo-300 transition-colors pr-3">
                      {activity.linkUrl}
                    </span>
                    <ExternalLink size={14} className="shrink-0 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                  </a>
                </GlassCard>
              )}

              {/* Quick status changer — pending | done | skipped */}
              <GlassCard className="!p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/25 mb-4">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((st) => {
                    const cfg      = STATUS_CFG[st];
                    const isActive = activity.status === st;
                    return (
                      <motion.button
                        key={st}
                        onClick={() => handleQuickStatus(st)}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border transition-all duration-200
                          ${isActive
                            ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                            : "bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/5 hover:text-white/35"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                          {cfg.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ══ EDIT MODE ══ */}
          {isEditing && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <GlassCard className="!p-0 overflow-hidden">
                {/* Edit header */}
                <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">
                    Editing Activity
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Activity title..."
                    className="w-full bg-transparent border-b border-white/10 pb-2
                               text-xl font-black text-white placeholder:text-white/20
                               outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {/* Fields */}
                <div className="px-6 py-6 space-y-5">

                  {/* Date & Time */}
                  <div>
                    <FieldLabel icon={CalendarDays}>Date &amp; Time</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className={`col-span-3 sm:col-span-1 ${inputCls}`}
                      />
                      <input
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className={inputCls}
                      />
                      <input
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Priority + Status */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <FieldLabel icon={Flag}>Priority</FieldLabel>
                      <div className="space-y-1.5">
                        {PRIORITIES.map((pr) => {
                          const cfg = PRIORITY_CFG[pr];
                          const isActive = editPriority === pr;
                          return (
                            <button
                              key={pr}
                              onClick={() => setEditPriority(pr)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
                                ${isActive
                                  ? `${cfg.active} ${cfg.text} ${cfg.border}`
                                  : "bg-transparent border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <FieldLabel icon={Zap}>Status</FieldLabel>
                      <div className="space-y-1.5">
                        {STATUSES.map((st) => {
                          const cfg = STATUS_CFG[st];
                          const isActive = editStatus === st;
                          return (
                            <button
                              key={st}
                              onClick={() => setEditStatus(st)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
                                ${isActive
                                  ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                                  : "bg-transparent border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <FieldLabel icon={AlignLeft}>Notes</FieldLabel>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add notes or details..."
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <FieldLabel icon={Link2}>Link URL</FieldLabel>
                    <div className="relative">
                      <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      <input
                        type="url"
                        value={editLinkUrl}
                        onChange={(e) => handleLinkChange(e.target.value)}
                        placeholder="https://..."
                        className={`${inputCls} pl-8 ${editLinkError ? "border-red-500/40" : ""}`}
                      />
                    </div>
                    {editLinkError && (
                      <p className="text-[10px] text-red-400 mt-1.5 ml-1">{editLinkError}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setMode("view")}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!canSave}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-black
                               disabled:opacity-30 disabled:cursor-not-allowed
                               shadow-[0_0_20px_rgba(99,102,241,0.25)]
                               hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete confirm */}
      <AnimatePresence>
        {showDelete && (
          <DeleteConfirm
            title={activity.title}
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}