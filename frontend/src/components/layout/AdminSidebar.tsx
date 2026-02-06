import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen">
      <div className="px-4 py-4 font-semibold text-lg border-b border-blue-800">
        BPS SPK & BAST
      </div>

      <nav className="p-4 space-y-1 text-sm">
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-700" : "hover:bg-blue-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/dashboard/mitra"
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-700" : "hover:bg-blue-800"
            }`
          }
        >
          Data Mitra
        </NavLink>

        <NavLink
          to="/admin/dashboard/saw"
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-700" : "hover:bg-blue-800"
            }`
          }
        >
          Perhitungan SAW
        </NavLink>

        <NavLink
          to="/admin/dashboard/spk/approval"
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${
              isActive ? "bg-blue-700" : "hover:bg-blue-800"
            }`
          }
        >
          Approval SPK
        </NavLink>
      </nav>
    </aside>
  );
}
