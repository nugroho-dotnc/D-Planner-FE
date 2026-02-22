import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Pages — Auth
import Login    from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Landing  from "../pages/Landing/Landing";

// Pages — App
import Dashboard    from "../pages/Dashboard/Dashboard";
import ChatPlanner from "../pages/Chat/ChatPlanner";
import PlanPreview  from "../pages/Preview/PlanPreview";
import Task         from "../pages/Task/Task";
import Activity     from "../pages/Activity/Activity";
import ActivityDetail from "../pages/Activity/ActivityDetail";
import Notes        from "../pages/Notes/Notes";
import NotesDetail  from "../pages/Notes/NotesDetail";

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