import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  LogOut,
  List,
} from "lucide-react";

export default function KetuaSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isSpkActive = location.pathname.startsWith("/ketua/spk");
  const isSawActive = location.pathname.startsWith("/ketua/saw");

  return (
    <aside className="w-64 bg-[#0f4c81] text-white flex flex-col min-h-screen shadow-lg">
      {/* HEADER */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wide">
          BADAN PUSAT STATISTIK
        </h1>
        <p className="text-xs text-white/70 mt-1">Sistem SPK & BAST</p>
      </div>

      {/* USER SECTION */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase() ?? "A"}
        </div>
        <div>
          <p className="text-sm font-semibold">{user?.name ?? "Ketua Tim"}</p>
          <p className="text-xs text-white/70">
            {user?.role?.replace("_", " ") ?? "Performance Evaluator"}
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        {/* DASHBOARD */}
        <NavLink
          to="/ketua/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-orange-500 text-white font-semibold"
                : "text-white/80 hover:bg-white/10"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* SPK */}
        <NavLink
          to="/ketua/spk"
          className={() =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isSpkActive
                ? "bg-orange-500 text-white font-semibold"
                : "text-white/80 hover:bg-white/10"
            }`
          }
        >
          <FileText size={18} />
          SPK Saya
        </NavLink>

        {/* SPK SUBMENU */}
        {isSpkActive && (
          <div className="ml-8 mt-1 space-y-1 text-xs">
            <NavLink
              to="/ketua/spk"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >
              <List size={14} />
              List SPK
            </NavLink>

            <NavLink
              to="/ketua/spk/create"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >
              <PlusCircle size={14} />
              Buat SPK
            </NavLink>
          </div>
        )}

        {/* SAW */}
        <NavLink
          to="/ketua/saw"
          end
          className={() =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isSawActive
                ? "bg-orange-500 text-white font-semibold"
                : "text-white/80 hover:bg-white/10"
            }`
          }
        >
          <BarChart3 size={18} />
          SAW Performance
        </NavLink>

        {/* SAW SUBMENU */}
        {isSawActive && (
          <div className="ml-8 mt-1 space-y-1 text-xs">
            <NavLink
              to="/ketua/saw"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >
              <BarChart3 size={14} />
              Hasil SAW
            </NavLink>

            <NavLink
              to="/ketua/saw/manual"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "hover:bg-white/10"
                }`
              }
            >
              <PlusCircle size={14} />
              Manual Penilaian
            </NavLink>
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
