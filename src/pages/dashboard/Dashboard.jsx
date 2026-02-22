import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Calendar, CheckSquare, StickyNote, Clock, Coffee, Zap,
  ChevronRight, Pin, Plus
} from "lucide-react";
import GlassCard from "../../components/cards/GlassCard";
import CircularProgress from "../../components/progress/CircularProgress";
import StatCard from "../../components/cards/StatCard";
import EmptyState from "../../components/feedback/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { useActivities } from "../../hooks/useActivities";
import { useTasks } from "../../hooks/useTasks";
import { useNotes } from "../../hooks/useNotes";
import FilterPill from "../../components/common/FilterPill";
import { useState, useMemo } from "react";

/* ── helpers ── */
const toISODate = (d) => d.toISOString().split("T")[0];
const today = new Date();
const todayISO = toISODate(today);

function calcFocusTime(activities) {
  let mins = 0;
  activities.forEach(({ startTime, endTime }) => {
    if (!startTime || !endTime) return;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) mins += diff;
  });
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

const statusConfig = {
  completed: { dot: "bg-green-400",              label: "Done",        labelColor: "text-green-400"  },
  ongoing:   { dot: "bg-indigo-400 animate-pulse", label: "In Progress", labelColor: "text-indigo-400" },
  pending:   { dot: "bg-white/20",               label: "Pending",     labelColor: "text-white/30"   },
};

const FILTER_TIME = [
  { value: "all",    label: "Semua" },
  { value: "today",  label: "Hari Ini" },
  { value: "7days",  label: "7 Hari" },
  { value: "1month", label: "1 Bulan" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterTime, setFilterTime] = useState("today");

  // SWR — fetch schedule activities
  // We fetch without date to allow filtering on frontend, or we could fetch based on selected range
  // For simplicity and matching Task page behavior, we'll use broad fetching if reasonable
  const { activities: rawActivities, isLoading: loadAct } = useActivities();

  // SWR — fetch all tasks
  const { tasks: rawTasks, isLoading: loadTask } = useTasks();

  // SWR — fetch notes
  const { notes: rawNotes, isLoading: loadNote } = useNotes();

  /* ── Derived ── */
  const filteredData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayISO = now.toISOString().split("T")[0];

    const filterFn = (item) => {
      if (filterTime === "all") return true;
      if (!item.date && !item.relatedDate) return false;
      
      const dateStr = (item.date || item.relatedDate || "").split("T")[0];
      if (!dateStr) return false;

      if (filterTime === "today") return dateStr === todayISO;

      const itemDate = new Date(dateStr);
      itemDate.setHours(0, 0, 0, 0);

      if (filterTime === "7days") {
        const limit = new Date(now);
        limit.setDate(now.getDate() + 7);
        return itemDate >= now && itemDate < limit;
      }
      if (filterTime === "1month") {
        const limit = new Date(now);
        limit.setMonth(now.getMonth() + 1);
        return itemDate >= now && itemDate < limit;
      }
      return true;
    };

    const activities = rawActivities.filter(filterFn);
    const tasks      = rawTasks.filter(filterFn);
    const notes      = rawNotes.filter(filterFn);

    return { activities, tasks, notes };
  }, [rawActivities, rawTasks, rawNotes, filterTime]);

  const { activities, tasks, notes } = filteredData;

  const todaySchedule   = activities.slice(0, 2);
  const moreScheduleCount = activities.length - todaySchedule.length;

  const todayTasks     = tasks.slice(0, 3);
  const moreTasksCount = tasks.length - todayTasks.length;

  const displayNotes   = notes.slice(0, 3);
  const moreNotesCount = notes.length - displayNotes.length;

  const completedTasks  = tasks.filter((t) => t.status === "done" || t.status === "completed").length;
  const productivityPct = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const focusTime = calcFocusTime(activities);

  /* ── Loading skeleton ── */
  const isLoading = loadAct || loadTask || loadNote;

  /* ── Greeting ── */
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const userName  = user?.name ?? "Friend";

  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {greeting}, {userName} ☀️
          </h1>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
          {FILTER_TIME.map((f) => (
            <FilterPill
              key={f.value}
              value={f.value}
              active={filterTime === f.value}
              onClick={setFilterTime}
            >
              {f.label}
            </FilterPill>
          ))}
        </div>
      </motion.div>

      {/* Productivity Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
        <GlassCard className="flex items-center justify-center !p-8 md:!p-10">
          <CircularProgress percentage={productivityPct} size={140} />
          <div className="ml-8 hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Status</p>
            <p className="text-lg font-bold text-white uppercase">
              {productivityPct >= 80 ? "Excellent!" : productivityPct >= 50 ? "On Track" : "Getting Started"}
            </p>
            <p className="text-xs text-white/40 tracking-tight">
              {completedTasks} / {tasks.length} tasks done
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          <StatCard label="Focus Time"  value={focusTime}                      icon={Zap} onClick={() => navigate("/activity")} />
          <StatCard label="Activities"  value={String(activities.length)} icon={Clock} onClick={() => navigate("/activity")} />
          <StatCard label="Tasks Done"  value={String(completedTasks)}         icon={Coffee} className="hidden lg:flex" onClick={() => navigate("/task")} />
        </div>
      </motion.div>

      {/* Daily Task Progress */}
      <motion.div variants={itemVariants}>
        <GlassCard className="!p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Daily Task Progress</p>
            <p className="text-xs font-bold text-indigo-400">{completedTasks} / {tasks.length} Tasks</p>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${productivityPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Schedule */}
        <motion.div variants={itemVariants}>
          <GlassCard
            className="h-[400px] flex flex-col hover:border-white/20 transition-colors cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); navigate("/activity"); }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><Calendar size={18} /></div>
                <h3 className="text-sm font-black uppercase tracking-wider">Schedule</h3>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
            </div>

            <div className="relative space-y-4 flex-1">
              {todaySchedule.length > 0 && (
                <div className="absolute left-[3.05rem] top-2 bottom-2 w-px bg-white/10" />
              )}
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item, index) => {
                  const s = statusConfig[item.status] ?? statusConfig.pending;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-10 pt-1 text-right shrink-0">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">
                          {item.startTime}
                        </span>
                      </div>
                      <div className="relative flex flex-col items-center shrink-0 pt-2">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 border-[#0B1220] z-10 ${s.dot}`} />
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); navigate(`/activity/${item.id}`); }}
                        className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all min-w-0 cursor-pointer"
                      >
                        <h4 className={`text-sm font-bold truncate mb-1 ${item.status === "completed" ? "text-white/30" : "text-white"}`}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-white/20 shrink-0">
                            {item.startTime} — {item.endTime}
                          </span>
                          <span className="text-white/10">·</span>
                          <span className={`flex items-center gap-1 text-[10px] font-bold ${s.labelColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyState
                  message={loadAct ? "Loading..." : "No activities planned for today yet."}
                  onAction={(e) => { e.stopPropagation(); navigate("/activity"); }}
                  icon={Calendar}
                />
              )}
            </div>

            {moreScheduleCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-indigo-400 transition-colors">
                <Plus size={10} /> {moreScheduleCount} more activities
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Tasks */}
        <motion.div variants={itemVariants}>
          <GlassCard
            className="h-[400px] flex flex-col hover:border-white/20 transition-colors cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); navigate("/task"); }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><CheckSquare size={18} /></div>
                <h3 className="text-sm font-black uppercase tracking-wider">Tasks</h3>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
            </div>

            <div className="space-y-3 flex-1 overflow-hidden">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group/item cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); navigate("/task"); }}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      task.status === "done" || task.status === "completed"
                        ? "bg-indigo-500 border-indigo-500 text-white scale-110 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        : "border-white/20"
                    }`}>
                      {(task.status === "done" || task.status === "completed") && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckSquare size={12} />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-xs font-bold transition-all duration-300 ${
                      task.status === "done" || task.status === "completed"
                        ? "text-white/20 line-through"
                        : "text-white/80"
                    }`}>
                      {task.title}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  message={loadTask ? "Loading..." : "Your task list is empty."}
                  onAction={(e) => { e.stopPropagation(); navigate("/task"); }}
                  icon={CheckSquare}
                />
              )}
            </div>

            {moreTasksCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-blue-400 transition-colors">
                <Plus size={10} /> {moreTasksCount} more tasks
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants}>
          <GlassCard
            className="h-[400px] flex flex-col hover:border-white/20 transition-colors cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); navigate("/notes"); }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><StickyNote size={18} /></div>
                <h3 className="text-sm font-black uppercase tracking-wider">Latest Notes</h3>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
            </div>

            <div className="space-y-3 flex-1 overflow-hidden">
              {displayNotes.length > 0 ? (
                displayNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note.id}`); }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StickyNote size={14} className="text-white/20 shrink-0" />
                      <span className="text-xs font-bold text-white/80 truncate">{note.title}</span>
                    </div>
                    {note.isPinned && <Pin size={12} className="text-indigo-400 rotate-45 shrink-0" />}
                  </div>
                ))
              ) : (
                <EmptyState
                  message={loadNote ? "Loading..." : "No notes saved yet."}
                  onAction={(e) => { e.stopPropagation(); navigate("/notes"); }}
                  icon={StickyNote}
                />
              )}
            </div>

            {moreNotesCount > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-purple-400 transition-colors">
                <Plus size={10} /> {moreNotesCount} more notes
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;