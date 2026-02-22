import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, CheckSquare, Search, X, Trash2,
  Flag, CalendarDays, Clock, AlignLeft, Check,
} from "lucide-react";
import GlassCard from "../../components/cards/GlassCard";
import { useTasks } from "../../hooks/useTasks";
import FilterPill from "../../components/common/FilterPill";

/* ─────────────────────────────────────────
   Design tokens
───────────────────────────────────────── */
const PRIORITY_CFG = {
  high:   { label: "High",   text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    dot: "bg-red-400",    active: "bg-red-500/20"    },
  medium: { label: "Medium", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", dot: "bg-yellow-400", active: "bg-yellow-500/20" },
  low:    { label: "Low",    text: "text-white/40",   bg: "bg-white/5",       border: "border-white/10",      dot: "bg-white/30",   active: "bg-white/10"      },
};

const PRIORITIES        = ["high", "medium", "low"];
const FILTER_PRIORITIES = ["all", "high", "medium", "low"];
const FILTER_STATUSES   = ["all", "pending", "done"];
const FILTER_TIME = [
  { value: "all",    label: "Semua" },
  { value: "today",  label: "Hari Ini" },
  { value: "7days",  label: "7 Hari" },
  { value: "1month", label: "1 Bulan" },
];

/* ─────────────────────────────────────────
   Shared: FieldLabel + inputCls
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Add Task Modal
───────────────────────────────────────── */
const defaultForm = { title: "", description: "", priority: "medium", date: "", startTime: "", endTime: "" };

function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [form,   setForm]   = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen)  setTimeout(() => titleRef.current?.focus(), 150);
    else         setForm(defaultForm);
  }, [isOpen]);

  const canSubmit = form.title.trim() && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onAdd({
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        date:        form.date      || null,
        startTime:   form.startTime || null,
        endTime:     form.endTime   || null,
      });
      onClose();
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape")            onClose();
    if (e.key === "Enter" && e.metaKey) handleSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
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

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <p className="text-xs font-black uppercase tracking-widest text-white/50">New Task</p>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <input
                  ref={titleRef}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title..."
                  className="w-full bg-transparent border-b border-white/10 pb-2
                             text-base font-black text-white placeholder:text-white/20
                             outline-none focus:border-indigo-500/50 transition-all"
                />

                {/* Description */}
                <div>
                  <FieldLabel icon={AlignLeft}>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional notes..."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Priority */}
                <div>
                  <FieldLabel icon={Flag}>Priority</FieldLabel>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => {
                      const cfg = PRIORITY_CFG[p];
                      const isActive = form.priority === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all
                            ${isActive
                              ? `${cfg.active} ${cfg.text} ${cfg.border}`
                              : "bg-transparent border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                            }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date + Time */}
                <div>
                  <FieldLabel icon={CalendarDays}>Date &amp; Time</FieldLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className={`col-span-3 sm:col-span-1 ${inputCls}`}
                    />
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
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
                             hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-all"
                >
                  {saving ? "Saving..." : "Add Task"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Delete Confirm
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
        <h3 className="text-base font-black text-white text-center mb-1">Delete Task?</h3>
        <p className="text-xs font-bold text-white/30 text-center mb-1 px-4 truncate">"{title}"</p>
        <p className="text-[10px] text-white/20 text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/[0.08] text-sm font-bold text-white/40 hover:bg-white/8 transition-all"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            whileTap={{ scale: 0.97 }}
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

/* ─────────────────────────────────────────
   Task Item row
───────────────────────────────────────── */
function TaskItem({ task, onToggle, onRequestDelete, index }) {
  const cfg  = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.low;
  const done = task.status === "done";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className="group"
    >
      <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200
        ${done
          ? "bg-white/[0.02] border-white/[0.04]"
          : "bg-white/[0.04] border-white/[0.07] hover:border-white/[0.14]"
        }`}
      >
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggle(task.id, task.status)}
          className={`shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-250
            ${done
              ? "bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
              : "border-white/20 hover:border-indigo-400/70"
            }`}
        >
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check size={11} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + priority badge */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-sm font-bold transition-all duration-300 ${done ? "line-through text-white/20" : "text-white/85"}`}>
              {task.title}
            </span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider
              ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-[11px] font-medium truncate transition-all ${done ? "text-white/15" : "text-white/35"}`}>
              {task.description}
            </p>
          )}

          {/* Date + time */}
          {(task.date || task.startTime) && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {task.date && (
                <span className="flex items-center gap-1 text-[10px] text-white/20 font-medium">
                  <CalendarDays size={9} />
                  {String(task.date).slice(0, 10)}
                </span>
              )}
              {task.startTime && (
                <span className="flex items-center gap-1 text-[10px] text-white/20 font-medium">
                  <Clock size={9} />
                  {task.startTime}{task.endTime ? ` — ${task.endTime}` : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Delete — visible on hover */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRequestDelete(task)}
          className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center
                     text-white/15 hover:text-red-400 hover:bg-red-500/10
                     transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Filter pill
───────────────────────────────────────── */

/* ═══════════════════════════════════════
   Task Page
═══════════════════════════════════════ */
export default function Task() {
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterTime,     setFilterTime]     = useState("all");
  const [search,         setSearch]         = useState("");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);

  const { tasks, isLoading, addTask, removeTask, toggleStatus } = useTasks();

  /* ── Derived: filtered list ── */
  const filtered = useMemo(() => {
    let list = tasks;

    // Time filtering
    if (filterTime !== "all") {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const todayISO = now.toISOString().split("T")[0];

      list = list.filter((t) => {
        if (!t.date) return false;
        const taskDateStr = typeof t.date === 'string' ? t.date.split("T")[0] : "";
        if (!taskDateStr) return false;

        if (filterTime === "today") {
          return taskDateStr === todayISO;
        }

        const taskDate = new Date(taskDateStr);
        taskDate.setHours(0, 0, 0, 0);

        if (filterTime === "7days") {
          const limit = new Date(now);
          limit.setDate(now.getDate() + 7);
          return taskDate >= now && taskDate < limit;
        }

        if (filterTime === "1month") {
          const limit = new Date(now);
          limit.setMonth(now.getMonth() + 1);
          return taskDate >= now && taskDate < limit;
        }
        return true;
      });
    }

    if (filterPriority !== "all") list = list.filter((t) => t.priority === filterPriority);
    if (filterStatus   !== "all") list = list.filter((t) => t.status   === filterStatus);
    if (search.trim())            list = list.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase())
    );
    // Sort: pending first, then by date (if exists) or createdAt
    return [...list].sort((a, b) => {
      // Pending first
      if (a.status === "pending" && b.status === "done") return -1;
      if (a.status === "done" && b.status === "pending") return 1;
      // Then newest first
      return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
    });
  }, [tasks, filterPriority, filterStatus, filterTime, search]);

  /* ── Derived: stats ── */
  const stats = useMemo(() => ({
    total:   tasks.length,
    done:    tasks.filter((t) => t.status   === "done").length,
    pending: tasks.filter((t) => t.status   === "pending").length,
    high:    tasks.filter((t) => t.priority === "high").length,
  }), [tasks]);

  /* ── Progress bar (done / total) ── */
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    removeTask(deleteTarget.id);
    setDeleteTarget(null);
  };

  const containerV = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemV = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <>
      <motion.div className="pb-12" variants={containerV} initial="hidden" animate="visible">

        {/* ── Header ── */}
        <motion.div variants={itemV} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">Personal</p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Tasks</h1>
          </div>
          <motion.button
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-500 text-white
                       text-xs font-black uppercase tracking-wider
                       shadow-[0_0_20px_rgba(99,102,241,0.3)]
                       hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] transition-all"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </motion.div>

        {/* ── Stats + progress ── */}
        <motion.div variants={itemV} className="mb-8 space-y-4">
          {/* Progress overview */}
          <GlassCard className="!p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/25 mb-0.5">Progress Hari Ini</p>
                <p className="text-2xl font-black text-white">{progress}<span className="text-base text-white/30">%</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white/40">{stats.done} / {stats.total} selesai</p>
                {stats.high > 0 && (
                  <p className="text-[10px] font-bold text-red-400 mt-0.5">{stats.high} prioritas tinggi</p>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </GlassCard>

          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending",  value: stats.pending, color: "text-yellow-400" },
              { label: "Selesai",  value: stats.done,    color: "text-green-400"  },
              { label: "High Pri", value: stats.high,    color: "text-red-400"    },
            ].map((s) => (
              <GlassCard key={s.label} className="!p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mt-0.5">{s.label}</p>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div variants={itemV} className="space-y-3 mb-6">
          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-2xl pl-10 pr-10 py-3
                         text-xs font-bold text-white/70 placeholder:text-white/20
                         outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.03] transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  <X size={13} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Priority + Status pills */}
         <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/20 mr-0.5">Priority:</span>
                {FILTER_PRIORITIES.map((p) => (
                  <FilterPill key={p} value={p} active={filterPriority === p} onClick={setFilterPriority}>
                    {p === "all" ? "All" : PRIORITY_CFG[p]?.label ?? p}
                  </FilterPill>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/20 mr-0.5">Status:</span>
                {FILTER_STATUSES.map((s) => (
                  <FilterPill key={s} value={s} active={filterStatus === s} onClick={setFilterStatus}>
                    {s === "all" ? "All" : s === "done" ? "Done" : "Pending"}
                  </FilterPill>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/20 mr-0.5">Waktu:</span>
                {FILTER_TIME.map((f) => (
                  <FilterPill key={f.value} value={f.value} active={filterTime === f.value} onClick={setFilterTime}>
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>
        </motion.div>

        {/* ── Task list ── */}
        <motion.div variants={itemV} className="space-y-2">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/10 border-t-indigo-400 rounded-full"
              />
              <p className="text-xs text-white/25 font-medium">Loading tasks...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <CheckSquare size={22} className="text-white/15" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/25 mb-1">
                  {tasks.length === 0 ? "No tasks yet" : "No tasks match"}
                </p>
                <p className="text-xs text-white/15">
                  {tasks.length === 0 ? "Add your first task to get started." : "Try adjusting your filters."}
                </p>
              </div>
              {tasks.length === 0 && (
                <motion.button
                  onClick={() => setModalOpen(true)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20
                             text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all"
                >
                  + New Task
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Items */}
          <AnimatePresence mode="popLayout">
            {filtered.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                index={i}
                onToggle={toggleStatus}
                onRequestDelete={(t) => setDeleteTarget(t)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      {/* ── Modals ── */}
      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addTask}
      />

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            title={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}