import { motion } from "motion/react";

/**
 * Reusable Circular Progress component
 * @param {number} percentage - 0 to 100
 * @param {number} size - Width/Height in pixels
 * @param {number} strokeWidth - Thickness of the progress stroke
 * @param {string} color - Tailwind color class or hex
 */
const CircularProgress = ({ 
  percentage = 0, 
  size = 120, 
  strokeWidth = 10,
  color = "var(--color-primary)" 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/5"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white">{percentage}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
