import { Routes, Route } from "react-router-dom";

import RootRedirect from "../pages/RootRedirect";
import ProtectedRoute from "../auth/ProtectedRoute";

// layouts
import AdminLayout from "../components/layout/AdminLayout";
import MitraLayout from "../components/mitralayout/MitraLayout";

// admin pages
import Dashboard from "../pages/admin/Dashboard";
import SawPage from "../pages/admin/SawPage";
import MitraList from "../pages/admin/MitraList";

// 🔽 SPK pages
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
          <Route index element={<Dashboard />} />

          {/* MASTER DATA */}
          <Route path="mitra" element={<MitraList />} />

          {/* SAW */}
          <Route path="saw" element={<SawPage />} />

          {/* SPK */}
          <Route path="spk">
            {/* STATIC ROUTES FIRST */}
            <Route path="generate" element={<GenerateSPKPage />} />
            <Route path="approval" element={<SpkApprovalPage />} />

            {/* DYNAMIC ROUTE LAST */}
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
