import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function MitraNavbar() {
  const { logout } = useAuth();

  return (
    <header className="admin-navbar">
      {/* LEFT: System Identity */}
      <div className="admin-navbar__brand">
        <span className="brand-title">BPS SPK & BAST</span>
        <span className="brand-subtitle">Panel Mitra</span>
      </div>

      {/* CENTER: Navigation */}
      <nav className="admin-navbar__nav">
        <NavLink
          to="/mitra/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/mitra/alokasi-saya"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Alokasi Saya
        </NavLink>

        <NavLink
          to="/mitra/input-alokasi"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Input Alokasi
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
