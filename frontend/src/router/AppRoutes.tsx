import { Routes, Route } from "react-router-dom";
import RootRedirect from "../pages/RootRedirect";
import ProtectedRoute from "../auth/ProtectedRoute";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import MitraLayout from "../components/mitralayout/MitraLayout";
import KetuaLayout from "../components/ketua/KetuaLayout";

// Auth
import Login from "../pages/Login";

/* ================= ADMIN PAGES ================= */
import Dashboard from "../pages/admin/Dashboard";
import MataAnggaranList from "../pages/admin/MataAnggaranList";
import MataAnggaranForm from "../pages/admin/MataAnggaranForm";
import MitraList from "../pages/admin/MitraList";
import MitraForm from "../pages/admin/MitraForm";
import KegiatanList from "../pages/admin/KegiatanList";
import KegiatanForm from "../pages/admin/KegiatanForm";
import SawPage from "../pages/admin/SawPage";
import GenerateSPKPage from "../pages/admin/GenerateSpkPage";
import SpkApprovalPage from "../pages/admin/spk-approval/SpkApprovalPage";
import SpkDetailPage from "../pages/admin/detail/SpkDetailPage";
import KetuaList from "../pages/admin/KetuaList";
import KetuaForm from "../pages/admin/KetuaForm";

/* ================= MITRA PAGES ================= */
import MitraDashboard from "../pages/mitra/Dashboard";
import AlokasiSayaPage from "../pages/mitra/AlokasiSayaPage";
import InputAlokasiPage from "../pages/mitra/InputAlokasiPage";

/* ================= KETUA PAGES ================= */
import KetuaDashboard from "../pages/ketua/Dashboard";
import KetuaSpkList from "../pages/ketua/SpkList";
import KetuaSpkCreate from "../pages/ketua/SpkCreate";
import KetuaSpkDetail from "../pages/ketua/SpkDetail";

import PerformanceSawPage from "../pages/ketua/saw/PerformanceSawPage";
import PerformanceSawManualPage from "../pages/ketua/saw/PerformanceSawManualPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="mata-anggaran" element={<MataAnggaranList />} />
          <Route path="mata-anggaran/create" element={<MataAnggaranForm />} />
          <Route path="mata-anggaran/:id/edit" element={<MataAnggaranForm />} />

          <Route path="mitra" element={<MitraList />} />
          <Route path="mitra/create" element={<MitraForm />} />
          <Route path="mitra/:id/edit" element={<MitraForm />} />

          <Route path="kegiatan" element={<KegiatanList />} />
          <Route path="kegiatan/create" element={<KegiatanForm />} />
          <Route path="kegiatan/:id/edit" element={<KegiatanForm />} />

          <Route path="ketua" element={<KetuaList />} />
          <Route path="ketua/create" element={<KetuaForm />} />
          <Route path="ketua/:id/edit" element={<KetuaForm />} />

          <Route path="saw" element={<SawPage />} />

          <Route path="spk">
            <Route path="generate" element={<GenerateSPKPage />} />
            <Route path="approval" element={<SpkApprovalPage />} />
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

      {/* ================= KETUA ================= */}
      <Route element={<ProtectedRoute allowedRoles={["KETUA_TIM"]} />}>
        <Route path="/ketua" element={<KetuaLayout />}>
          <Route path="dashboard" element={<KetuaDashboard />} />

          <Route path="spk">
            <Route index element={<KetuaSpkList />} />
            <Route path="create" element={<KetuaSpkCreate />} />
            <Route path=":id" element={<KetuaSpkDetail />} />
          </Route>

          {/* 🔥 SAW ROUTES FIXED */}
          <Route path="saw">
            <Route index element={<PerformanceSawPage />} />
            <Route path="manual" element={<PerformanceSawManualPage />} />
          </Route>
        </Route>
      </Route>

      {/* ================= AUTH ================= */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
