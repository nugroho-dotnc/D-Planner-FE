import { motion } from "motion/react";
import { Plus } from "lucide-react";

/**
 * EmptyState
 * Reusable placeholder for empty categories in the dashboard.
 */
const EmptyState = ({ message, onAction, actionLabel = "Create Plan", icon: Icon }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
      {Icon && (
        <div className="p-3 rounded-full bg-white/5 text-white/20 mb-3">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      )}
      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 leading-relaxed max-w-[160px]">
        {message}
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all group"
      >
        <Plus size={14} className="group-hover:rotate-90 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-wider">{actionLabel}</span>
      </button>
    </div>
  );
};

export default EmptyState;
