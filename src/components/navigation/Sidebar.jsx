import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Calendar, StickyNote, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Tasks",     icon: CheckSquare,     path: "/task" },
  { label: "Schedule",  icon: Calendar,        path: "/activity" },
  { label: "Notes",     icon: StickyNote,      path: "/notes" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-58 h-screen fixed left-0 top-0 border-r border-white/10 bg-[#0B1220]/20 backdrop-blur-xl z-40">
      <div className="p-8">
        <div className="text-2xl font-black tracking-tighter text-white">D-PLANNER.</div>
      </div>

      <nav className="flex-1 px-4 py-4 scrollbar-hide overflow-y-auto">
        <div className="space-y-2">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"}
              `}
            >
              <item.icon size={22} className="shrink-0 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xs tracking-wide uppercase">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        {/* User Profile */}
        <div className="p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 shrink-0 flex items-center justify-center text-white font-black text-sm">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate uppercase">{user?.name ?? "User"}</p>
            <p className="text-[10px] font-medium text-white/30 truncate">{user?.email ?? ""}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group ring-1 ring-transparent hover:ring-red-500/20"
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-xs tracking-widest uppercase">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
