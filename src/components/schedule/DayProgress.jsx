import { motion } from "motion/react";
import { CheckCircle, Clock, Zap } from "lucide-react";
import GlassCard from "../cards/GlassCard";

/**
 * DayProgress
 * Shows activity completion progress for a selected day.
 *
 * Props:
 *  - total: number
 *  - completed: number
 *  - ongoing: number
 *  - totalDuration: string — e.g. "4h 30m"
 */
export default function DayProgress({ total = 0, completed = 0, ongoing = 0, totalDuration = "0m" }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { icon: CheckCircle, label: "Done", value: completed, color: "text-green-400" },
    { icon: Zap,         label: "Active", value: ongoing,   color: "text-indigo-400" },
    { icon: Clock,       label: "Total",  value: total,     color: "text-white/40" },
  ];

  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Day Progress</p>
        <span className="text-xs font-black text-indigo-400">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon size={12} className={color} />
            <span className="text-[10px] font-bold text-white/40">{label}</span>
            <span className={`text-xs font-black ${color}`}>{value}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-white/20" />
          <span className="text-xs font-black text-white/40">{totalDuration}</span>
        </div>
      </div>
    </GlassCard>
  );
}