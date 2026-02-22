import { motion } from "motion/react";
function PremiumButton({ children, onClick, variant = "primary" , className = ""}) {
  const isPrimary = variant === "primary";
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        ${className} px-8 py-3.5 rounded-full font-bold transition-colors duration-300 cursor-pointer
        ${isPrimary
          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          : "bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20"}
      `}
    >
      {children}
    </motion.button>
  );
}
export default PremiumButton;
