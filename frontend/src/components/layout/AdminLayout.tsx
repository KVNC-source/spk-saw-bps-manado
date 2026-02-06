import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <Outlet /> {/* 🔥 REQUIRED */}
    </div>
  );
}
