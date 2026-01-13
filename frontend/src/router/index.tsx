import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import MitraDashboard from "../pages/MitraDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";
import RootRedirect from "../pages/RootRedirect";

export default function AppRouter() {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<RootRedirect />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* SHARED */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* PROTECTED */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/mitra"
        element={
          <ProtectedRoute allowedRoles={["MITRA"]}>
            <MitraDashboard />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
