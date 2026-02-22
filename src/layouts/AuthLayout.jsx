import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full px-4">
        <Outlet />
      </div>
    </div>
  );
}