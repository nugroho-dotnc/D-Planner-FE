import React from "react";

/**
 * Reusable Filter Pill component
 * @param {string|number} value - The value to be set on click
 * @param {boolean} active - Whether the pill is currently active
 * @param {function} onClick - Callback function when pill is clicked
 * @param {React.ReactNode} children - The label or content of the pill
 */
const FilterPill = ({ value, active, onClick, children }) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
        ${active
          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
          : "bg-white/[0.03] border border-transparent text-white/25 hover:text-white/50 hover:border-white/10"
        }`}
    >
      {children}
    </button>
  );
};

export default FilterPill;
