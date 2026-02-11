import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function KetuaSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isSpkActive = location.pathname.startsWith("/ketua/spk");

  return (
    <aside className="w-64 bg-[#0f4c81] text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="font-bold text-lg">BPS SPK & BAST</h1>
        <p className="text-xs text-white/70">Panel Ketua Tim</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {/* Dashboard */}
        <NavLink
          to="/ketua/dashboard"
          end
          className={({ isActive }) =>
            isActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          Dashboard
        </NavLink>

        {/* SPK */}
        <NavLink
          to="/ketua/spk"
          className={() =>
            isSpkActive
              ? "block px-4 py-2 rounded-lg bg-white/15 font-semibold"
              : "block px-4 py-2 rounded-lg text-white/80 hover:bg-white/10"
          }
        >
          SPK Saya
        </NavLink>

        {/* Optional Quick Create */}
        {isSpkActive && (
          <div className="ml-4 mt-1 space-y-1 text-xs">
            <NavLink
              to="/ketua/spk"
              end
              className="block px-3 py-1 rounded hover:bg-white/10"
            >
              List SPK
            </NavLink>

            <NavLink
              to="/ketua/spk/create"
              className="block px-3 py-1 rounded hover:bg-white/10"
            >
              + Buat SPK
            </NavLink>
          </div>
        )}
      </nav>

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
