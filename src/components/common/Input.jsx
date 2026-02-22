import { motion } from "motion/react";

function Input({ label, type = "text", placeholder, value, onChange, icon, error, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-bold tracking-widest text-white/40 uppercase ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 outline-none
            text-white placeholder:text-white/20 transition-all duration-300
            ${icon ? "pl-12" : ""}
            focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10
            ${error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10" : ""}
          `}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-red-400 ml-1 uppercase">{error}</span>}
    </div>
  );
}

export default Input;
