import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import BottomNavbar from "../components/navigation/BottomNavbar";
import ChatFAB from "../components/navigation/ChatFAB";

/**
 * AppLayout
 * Responsive wrapper for the main application area.
 * Sidebar on Desktop (lg), BottomNavbar on Mobile.
 */
export default function AppLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat-planner";

  return (
    <div className="min-h-screen text-white bg-[#0B1220] flex flex-col lg:flex-row relative">
      <style>{`
        /* Static "Not Boring" App Background */
        .app-bg {
          position: fixed;
          inset: 0;
          z-index: -10;
          background: 
            radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
            #0B1220;
        }
        .app-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }
      `}</style>

      {/* Persistent App Background */}
      <div className="app-bg" />

      {/* Desktop Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className={`
        flex-1 flex flex-col relative
        /* Desktop: Padding left to account for fixed sidebar */
        lg:pl-64
        /* Mobile: Padding bottom to account for fixed navbar */
        pb-24 lg:pb-0
      `}>
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button */}
      {!isChatPage && <ChatFAB onClick={() => window.location.href = "/chat-planner"} />}

      {/* Mobile Navigation */}
      <BottomNavbar />
    </div>
  );
}