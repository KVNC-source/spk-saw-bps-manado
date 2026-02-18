import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { Users, Link as LinkIcon, Unlink } from "lucide-react";

interface ApiErrorResponse {
  message?: string;
}

interface Ketua {
  id: string;
  username: string;
  name: string;
  email?: string;
  mitra_id?: number;
  createdAt: string;
}

export default function KetuaList() {
  const [data, setData] = useState<Ketua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Ketua[]>("/spk/ketua");
      setData(res.data);
    } catch {
      setError("Gagal memuat data Ketua Tim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus Ketua Tim ini?")) return;

    try {
      await api.delete(`/spk/ketua/${id}`);
      setData((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      let message = "Ketua tidak dapat dihapus";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      alert(message);
    }
  };

  if (loading) return <p className="text-muted">Memuat data Ketua…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const total = data.length;
  const withMitra = data.filter((k) => k.mitra_id).length;
  const withoutMitra = total - withMitra;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-container space-y-8"
    >
      {/* HEADER */}
      <div>
        <h1 className="dashboard-title">Data Ketua Tim</h1>
        <p className="dashboard-subtitle">
          Kelola akun Ketua Tim dalam sistem SPK
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Total Ketua"
          value={total}
          color="blue"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Terhubung Mitra"
          value={withMitra}
          color="green"
          icon={<LinkIcon size={20} />}
        />

        <StatCard
          title="Belum Terhubung"
          value={withoutMitra}
          color="red"
          icon={<Unlink size={20} />}
        />
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Daftar Ketua Tim</h2>

          <Link
            to="/admin/ketua/create"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
          >
            Tambah Ketua
          </Link>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border">
          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Mitra ID</th>
                  <th className="px-4 py-3 text-left">Dibuat</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center">
                      Belum ada data Ketua Tim
                    </td>
                  </tr>
                ) : (
                  data.map((k, index) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {k.name}
                      </td>

                      <td className="px-4 py-3">{k.username}</td>

                      <td className="px-4 py-3">{k.email ?? "-"}</td>

                      <td className="px-4 py-3">{k.mitra_id ?? "-"}</td>

                      <td className="px-4 py-3">
                        {new Date(k.createdAt).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <Link
                          to={`/admin/ketua/${k.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(k.id)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   STAT CARD COMPONENT
========================= */

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "red";
  icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>

      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>
    </div>
  );
}
