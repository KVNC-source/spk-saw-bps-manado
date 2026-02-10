import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* LEFT: Sidebar */}
      <AdminSidebar />

      {/* RIGHT: Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Optional top spacing wrapper */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* 🔥 REQUIRED */}
        </main>
      </div>
    </div>
  );
}
