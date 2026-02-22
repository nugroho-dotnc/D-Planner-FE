import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import GlassCard from "../../components/cards/GlassCard";
import DatePickerStrip from "../../components/schedule/DatePickerStrip";
import MiniCalendar from "../../components/schedule/MiniCalendar";
import DayProgress from "../../components/schedule/DayProgress";
import Timeline from "../../components/schedule/Timeline";
import AddActivityModal from "../../components/schedule/AddActivityModal";

import { useActivities } from "../../hooks/useActivities";
import activityService from "../../services/app/activityService";

/* ── Helpers ── */
const toISODate = (date) => date.toISOString().split("T")[0];

const calcDuration = (activities) => {
  let totalMins = 0;
  activities.forEach(({ startTime, endTime }) => {
    if (!startTime || !endTime || typeof startTime !== "string" || typeof endTime !== "string") return;
    const sParts = startTime.split(":");
    const eParts = endTime.split(":");
    if (sParts.length < 2 || eParts.length < 2) return;
    const [sh, sm] = sParts.map(Number);
    const [eh, em] = eParts.map(Number);
    totalMins += (eh * 60 + em) - (sh * 60 + sm);
  });
  if (totalMins <= 0) return "0m";
  const h = Math.floor(totalMins / 60), m = totalMins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

export default function Activity() {
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [modalOpen,    setModalOpen]    = useState(false);

  const selectedISO = toISODate(selectedDate);

  /* ── SWR ── */
  const { activities, isLoading, mutate } = useActivities({ date: selectedISO });

  /* ── All activity dates (for calendar dots) ── */
  const { activities: allActivities } = useActivities();
  const activityDates = useMemo(
    () => [...new Set(allActivities.map((a) => a.date?.split("T")[0]))].filter(Boolean),
    [allActivities],
  );

  /* ── Derived ── */
  const dayActivities = useMemo(() =>
    [...activities].sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
    [activities],
  );

  const progressStats = useMemo(() => ({
    total:         dayActivities.length,
    // Backend status: done | skipped | pending (no "completed" or "ongoing")
    completed:     dayActivities.filter((a) => a.status === "done").length,
    ongoing:       0, // inferred client-side in TimelineItem, not stored in DB
    totalDuration: calcDuration(dayActivities),
  }), [dayActivities]);

  /* ── Handlers ── */
  const handleActivityClick  = (activity) =>
    navigate(`/activity/${activity.id}`, { state: { activity, mode: "view" } });

  const handleActivityEdit   = (activity) =>
    navigate(`/activity/${activity.id}`, { state: { activity, mode: "edit" } });

  const handleActivityDelete = async (id) => {
    await activityService.deleteActivity(id);
    mutate();
  };

  const handleAddConfirm = async (newActivity) => {
    // FIX: do NOT override type — respect what user selected in the form
    await activityService.createActivity(newActivity);
    mutate();
  };

  /* ── Animation ── */
  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemV      = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

  return (
    <>
      <motion.div className="pb-12" variants={containerV} initial="hidden" animate="visible">

        {/* Header */}
        <motion.div variants={itemV} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">
              {selectedDate.toLocaleDateString("id-ID", { weekday: "long", month: "long", year: "numeric" })}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Schedule</h1>
          </div>
          <motion.button
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] transition-all"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Activity</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </motion.div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-5">
          <motion.div variants={itemV}>
            <DatePickerStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
          </motion.div>
          <motion.div variants={itemV}>
            <DayProgress {...progressStats} />
          </motion.div>
          <motion.div variants={itemV}>
            <GlassCard className="!p-5">
              <Timeline
                activities={dayActivities}
                onActivityClick={handleActivityClick}
                onActivityEdit={handleActivityEdit}
                onActivityDelete={handleActivityDelete}
                onAdd={() => setModalOpen(true)}
                selectedDate={selectedDate}
                isLoading={isLoading}
              />
            </GlassCard>
          </motion.div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-6">
          <motion.div variants={itemV} className="space-y-5">
            <GlassCard className="!p-6">
              <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} activityDates={activityDates} />
            </GlassCard>
            <DayProgress {...progressStats} />
            <GlassCard className="!p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Activities</p>
              {dayActivities.length === 0 ? (
                <p className="text-xs text-white/20">{isLoading ? "Loading..." : "No activities this day."}</p>
              ) : (
                <div className="space-y-2">
                  {/* Backend statuses: done | skipped | pending */}
                  {[
                    { status: "done",    label: "Completed",  color: "text-green-400"  },
                    { status: "pending", label: "Pending",    color: "text-white/30"   },
                    { status: "skipped", label: "Skipped",    color: "text-white/20"   },
                  ].map(({ status, label, color }) => {
                    const count = dayActivities.filter((a) => a.status === status).length;
                    if (!count) return null;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${color}`}>{label}</span>
                        <span className={`text-xs font-black ${color}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>

          <motion.div variants={itemV}>
            <GlassCard className="!p-6 min-h-[600px]">
              <Timeline
                activities={dayActivities}
                onActivityClick={handleActivityClick}
                onActivityEdit={handleActivityEdit}
                onActivityDelete={handleActivityDelete}
                onAdd={() => setModalOpen(true)}
                selectedDate={selectedDate}
                isLoading={isLoading}
              />
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>

      <AddActivityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddConfirm}
        defaultDate={selectedDate}
      />
    </>
  );
}