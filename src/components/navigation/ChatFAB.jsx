import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

/**
 * Chat Floating Action Button (FAB)
 * Always visible, positioned differently on mobile vs desktop.
 */
const ChatFAB = ({onClick}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        fixed z-50 flex items-center justify-center
        bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-600
        text-white rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.4)]
        cursor-pointer transition-all duration-300
        /* Mobile Position: Bottom right, above bottom navbar */
        bottom-28 right-6 w-14 h-14
        /* Desktop Position: Bottom right */
        lg:bottom-8 lg:right-8 lg:w-16 lg:h-16
      `}
    >
      <Sparkles size={28} className="lg:hidden" />
      <Sparkles size={32} className="hidden lg:block" />

    </motion.button>
  );
};

export default ChatFAB;
