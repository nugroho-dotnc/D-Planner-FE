import GlassCard from "./GlassCard";

/**
 * Reusable Stat Card for dashboard overview
 */
const StatCard = ({ label, value, icon: Icon, className = "", onClick }) => {
  return (
    <GlassCard
      onClick={onClick}
      className={`!p-6 flex flex-col items-center justify-center text-center gap-4 min-w-[140px] flex-1 transition-all ${
        onClick ? "cursor-pointer hover:border-white/20 hover:bg-white/5 active:scale-[0.98]" : ""
      } ${className}`}
    >
      {Icon && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
          <Icon size={24} strokeWidth={2.5} />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
        <p className="text-xl md:text-2xl font-black text-white tracking-tight">{value}</p>
      </div>
    </GlassCard>
  );
};

export default StatCard;
