import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, CheckSquare, Calendar, StickyNote } from "lucide-react";

const MENU_ITEMS = [
  { label: "Home",     icon: LayoutDashboard, path: "/dashboard" },
  { label: "Tasks",    icon: CheckSquare,     path: "/task" },
  { label: "Schedule", icon: Calendar,        path: "/activity" },
  { label: "Notes",    icon: StickyNote,      path: "/notes" },
];

const BottomNavbar = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md
                    bg-[#0d1828]/70 backdrop-blur-[24px] border border-white/10 rounded-[32px] 
                    px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around relative">
        {MENU_ITEMS.map((item) => {
          // Exact match for most, but allow sub-routes (like details) if needed
          // For dash/task/activity/notes, we usually want them as primary active
          const isActive = location.pathname.startsWith(item.path);

          return (
            <motion.div key={item.path} className="relative flex-1">
              <NavLink
                to={item.path}
                className={`
                  flex flex-col items-center justify-center py-2.5 transition-all duration-300 relative z-10
                  ${isActive ? "text-white" : "text-white/20 hover:text-white/40"}
                `}
              >
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="text-[8px] font-black uppercase tracking-[0.15em] mt-1 pr-[0.15em]"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>

              {isActive && (
                <motion.div 
                  layoutId="liquidTab"
                  className="absolute inset-x-1.5 inset-y-0.5 bg-indigo-500/20 border border-indigo-500/20 rounded-[24px] -z-0
                             shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;