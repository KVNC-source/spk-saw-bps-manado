import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0f4c81] text-white flex flex-col">
      {/* BRAND */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="font-bold text-lg leading-tight">BPS SPK & BAST</h1>
        <p className="text-xs text-white/70">Panel Admin</p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/dashboard/mitra"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Data Mitra
        </NavLink>

        <NavLink
          to="/admin/dashboard/kegiatan"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Data Kegiatan
        </NavLink>

        <NavLink
          to="/admin/dashboard/mata-anggaran"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Data Mata Anggaran
        </NavLink>

        <NavLink
          to="/admin/dashboard/saw"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Perhitungan SAW
        </NavLink>

        <NavLink
          to="/admin/dashboard/spk/generate"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Generate SPK
        </NavLink>

        <NavLink
          to="/admin/dashboard/spk/approval"
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Persetujuan SPK
        </NavLink>
      </nav>

      {/* LOGOUT */}
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full text-left text-sm text-white/80 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
