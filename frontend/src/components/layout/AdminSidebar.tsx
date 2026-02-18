import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderKanban,
  FileText,
  Calculator,
  CheckCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isMitraActive = location.pathname.startsWith("/admin/mitra");
  const isKetuaActive = location.pathname.startsWith("/admin/ketua");
  const isKegiatanActive = location.pathname.startsWith("/admin/kegiatan");
  const isAnggaranActive = location.pathname.startsWith("/admin/mata-anggaran");

  const [openMitra, setOpenMitra] = useState(isMitraActive);
  const [openKetua, setOpenKetua] = useState(isKetuaActive);
  const [openKegiatan, setOpenKegiatan] = useState(isKegiatanActive);
  const [openAnggaran, setOpenAnggaran] = useState(isAnggaranActive);

  /* 🔶 MAIN MENU STYLE (ORANGE ACTIVE) */
  const mainNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-orange-500 text-white font-semibold"
        : "text-white/80 hover:bg-white/10"
    }`;

  const mainButtonClass = (active: boolean) =>
    `flex justify-between items-center w-full px-4 py-2 rounded-lg transition ${
      active
        ? "bg-orange-500 text-white font-semibold"
        : "text-white/80 hover:bg-white/10"
    }`;

  /* 🔹 DROPDOWN STYLE (NO ORANGE) */
  const subNavClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg transition ${
      isActive
        ? "bg-white/20 text-white font-medium"
        : "text-white/70 hover:bg-white/10"
    }`;

  return (
    <aside className="w-64 bg-[#0f4c81] text-white min-h-screen flex flex-col shadow-lg">
      {/* HEADER */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wide">
          BADAN PUSAT STATISTIK
        </h1>
        <p className="text-xs text-white/70 mt-1">Sistem SPK & BAST</p>
      </div>

      {/* PROFILE */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
          A
        </div>
        <div>
          <p className="text-sm font-semibold">Admin BPS</p>
          <p className="text-xs text-white/70">Administrator</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={mainNavClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* MITRA */}
        <div>
          <button
            onClick={() => setOpenMitra(!openMitra)}
            className={mainButtonClass(isMitraActive)}
          >
            <div className="flex items-center gap-3">
              <Users size={18} />
              Data Mitra
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openMitra ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openMitra ? "max-h-40 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-6 space-y-1">
              <NavLink to="/admin/mitra" className={subNavClass}>
                List Mitra
              </NavLink>
              <NavLink to="/admin/mitra/create" className={subNavClass}>
                Tambah Mitra
              </NavLink>
            </div>
          </div>
        </div>

        {/* KETUA */}
        <div>
          <button
            onClick={() => setOpenKetua(!openKetua)}
            className={mainButtonClass(isKetuaActive)}
          >
            <div className="flex items-center gap-3">
              <UserPlus size={18} />
              Data Ketua
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openKetua ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openKetua ? "max-h-40 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-6 space-y-1">
              <NavLink to="/admin/ketua" className={subNavClass}>
                List Ketua
              </NavLink>
              <NavLink to="/admin/ketua/create" className={subNavClass}>
                Tambah Ketua
              </NavLink>
            </div>
          </div>
        </div>

        {/* KEGIATAN */}
        <div>
          <button
            onClick={() => setOpenKegiatan(!openKegiatan)}
            className={mainButtonClass(isKegiatanActive)}
          >
            <div className="flex items-center gap-3">
              <FolderKanban size={18} />
              Data Kegiatan
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openKegiatan ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openKegiatan ? "max-h-40 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-6 space-y-1">
              <NavLink to="/admin/kegiatan" className={subNavClass}>
                List Kegiatan
              </NavLink>
              <NavLink to="/admin/kegiatan/create" className={subNavClass}>
                Tambah Kegiatan
              </NavLink>
            </div>
          </div>
        </div>

        {/* MATA ANGGARAN */}
        <div>
          <button
            onClick={() => setOpenAnggaran(!openAnggaran)}
            className={mainButtonClass(isAnggaranActive)}
          >
            <div className="flex items-center gap-3">
              <Calculator size={18} />
              Data Mata Anggaran
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                openAnggaran ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openAnggaran ? "max-h-40 mt-2" : "max-h-0"
            }`}
          >
            <div className="ml-6 space-y-1">
              <NavLink to="/admin/mata-anggaran" className={subNavClass}>
                List Mata Anggaran
              </NavLink>
              <NavLink to="/admin/mata-anggaran/create" className={subNavClass}>
                Tambah Mata Anggaran
              </NavLink>
            </div>
          </div>
        </div>

        {/* SPK */}
        <NavLink to="/admin/spk/generate" className={mainNavClass}>
          <FileText size={18} />
          Generate SPK
        </NavLink>

        <NavLink to="/admin/spk/approval" className={mainNavClass}>
          <CheckCircle size={18} />
          Persetujuan SPK
        </NavLink>
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
