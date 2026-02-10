import { Routes, Route } from "react-router-dom";

// mata anggaran admin
import MataAnggaranList from "../pages/admin/MataAnggaranList";
import MataAnggaranForm from "../pages/admin/MataAnggaranForm";

import RootRedirect from "../pages/RootRedirect";
import ProtectedRoute from "../auth/ProtectedRoute";

// layouts
import AdminLayout from "../components/layout/AdminLayout";
import MitraLayout from "../components/mitralayout/MitraLayout";

// admin pages
import Dashboard from "../pages/admin/Dashboard";
import SawPage from "../pages/admin/SawPage";

// mitra admin
import MitraList from "../pages/admin/MitraList";
import MitraForm from "../pages/admin/MitraForm";

// kegiatan admin
import KegiatanList from "../pages/admin/KegiatanList";
import KegiatanForm from "../pages/admin/KegiatanForm";

// SPK pages
import GenerateSPKPage from "../pages/admin/GenerateSpkPage";
import SpkApprovalPage from "../pages/admin/spk-approval/SpkApprovalPage";
import SpkDetailPage from "../pages/admin/detail/SpkDetailPage";

// mitra pages
import MitraDashboard from "../pages/mitra/Dashboard";
import AlokasiSayaPage from "../pages/mitra/AlokasiSayaPage";
import InputAlokasiPage from "../pages/mitra/InputAlokasiPage";

// auth
import Login from "../pages/Login";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= ENTRY ================= */}
      <Route path="/" element={<RootRedirect />} />

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* ================= MASTER DATA ================= */}
          <Route path="mata-anggaran" element={<MataAnggaranList />} />
          <Route path="mata-anggaran/create" element={<MataAnggaranForm />} />
          <Route path="mata-anggaran/:id/edit" element={<MataAnggaranForm />} />

          {/* MITRA */}
          <Route path="mitra" element={<MitraList />} />
          <Route path="mitra/create" element={<MitraForm />} />
          <Route path="mitra/:id/edit" element={<MitraForm />} />

          {/* KEGIATAN */}
          <Route path="kegiatan" element={<KegiatanList />} />
          <Route path="kegiatan/create" element={<KegiatanForm />} />
          <Route path="kegiatan/:id/edit" element={<KegiatanForm />} />

          {/* ================= SAW ================= */}
          <Route path="saw" element={<SawPage />} />

          {/* ================= SPK ================= */}
          <Route path="spk">
            {/* static routes first */}
            <Route path="generate" element={<GenerateSPKPage />} />
            <Route path="approval" element={<SpkApprovalPage />} />

            {/* dynamic route last */}
            <Route path=":id" element={<SpkDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* ================= MITRA ================= */}
      <Route element={<ProtectedRoute allowedRoles={["MITRA"]} />}>
        <Route path="/mitra" element={<MitraLayout />}>
          <Route path="dashboard" element={<MitraDashboard />} />
          <Route path="alokasi-saya" element={<AlokasiSayaPage />} />
          <Route path="input-alokasi" element={<InputAlokasiPage />} />
        </Route>
      </Route>

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
