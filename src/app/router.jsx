import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Pages — Auth
import Login    from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Landing  from "../pages/landing/Landing";

// Pages — App
import Dashboard    from "../pages/dashboard/Dashboard";
import ChatPlanner from "../pages/chat/ChatPlanner";
import PlanPreview  from "../pages/preview/PlanPreview";
import Task         from "../pages/task/Task";
import Activity     from "../pages/activity/Activity";
import ActivityDetail from "../pages/activity/ActivityDetail";
import Notes        from "../pages/notes/Notes";
import NotesDetail  from "../pages/notes/NotesDetail";

// ── Root wrapper that provides Auth context inside Router ──
function RootWithAuth() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootWithAuth />,
    children: [
      // ── Auth layout (public) ──
      {
        element: <AuthLayout />,
        children: [
          { path: "/",        element: <Landing /> },
          { path: "/login",   element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
      // ── App layout (protected) ──
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "/dashboard",      element: <Dashboard /> },
          { path: "/chat-planner",   element: <ChatPlanner /> },
          { path: "/preview",        element: <PlanPreview /> },
          { path: "/task",           element: <Task /> },
          { path: "/activity",       element: <Activity /> },
          { path: "/activity/:id",   element: <ActivityDetail /> },
          { path: "/notes",          element: <Notes /> },
          { path: "/notes/:id",      element: <NotesDetail /> },
        ],
      },
    ],
  },
]);

export default router;