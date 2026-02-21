import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

import bgImage from "../assets/IMG_2395.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(username, password);

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "MITRA") {
        navigate("/mitra/dashboard", { replace: true });
      } else if (user.role === "KETUA_TIM") {
        navigate("/ketua/dashboard", { replace: true });
      }
    } catch {
      setError("Username atau password salah");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ================= LEFT SIDE ================= */}
      <div className="hidden md:flex w-1/2 relative bg-blue-900 text-white">
        <img
          src={bgImage}
          alt="Manado"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="relative z-10 p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4 leading-snug">
            Sistem Beban Kerja Mitra <br />
            Badan Pusat Statistik
          </h1>

          <p className="text-sm opacity-90 mb-8 max-w-md">
            Platform terintegrasi untuk pengelolaan data statistik Kota Manado
            yang akurat dan terpercaya.
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <img
              src="/Logo BPS - Original.png" // 🔥 put BPS logo in public folder
              alt="BPS"
              className="h-14 mx-auto mb-2"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              BPS KOTA MANADO
            </h2>
            <p className="text-sm text-gray-500">Masuk ke SIBEMI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <input
                type="text"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Ingat saya
              </label>

              <button type="button" className="text-blue-600 hover:underline">
                Lupa password?
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg transition"
            >
              Masuk ke SIBEMI
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Butuh bantuan?{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Hubungi Administrator
            </span>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t">
            © 2026 Badan Pusat Statistik Kota Manado <br />
            Sistem Beban Kerja Mitra v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
