import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function AdminNavbar() {
  const { logout } = useAuth();

  return (
    <header className="admin-navbar">
      {/* LEFT: System Identity */}
      <div className="admin-navbar__brand">
        <span className="brand-title">BPS SPK & BAST</span>
        <span className="brand-subtitle">Panel Admin</span>
      </div>

      {/* CENTER: Navigation */}
      <nav className="admin-navbar__nav">
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/dashboard/mitra"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Data Mitra
        </NavLink>

        <NavLink
          to="/admin/dashboard/saw"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Perhitungan SAW
        </NavLink>

        {/* 🆕 Generate SPK */}
        <NavLink
          to="/admin/dashboard/spk/generate"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Generate SPK
        </NavLink>

        {/* SPK Approval */}
        <NavLink
          to="/admin/dashboard/spk/approval"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Persetujuan SPK
        </NavLink>
      </nav>

      {/* RIGHT: Actions */}
      <div className="admin-navbar__actions">
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
