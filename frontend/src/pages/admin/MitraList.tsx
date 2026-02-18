import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "@/lib/axios";
import { Users, Landmark } from "lucide-react";

interface Mitra {
  id: number;
  nama_mitra: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  bank?: string;
  no_rekening?: string;
}

export default function MitraList() {
  const [data, setData] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Mitra[]>("/admin/mitra")
      .then((res) => setData(res.data))
      .catch(() => setError("Gagal memuat data mitra"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Memuat data mitra…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const total = data.length;
  const bankTerdaftar = data.filter((m) => m.bank).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-container space-y-8"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="dashboard-title">Data Mitra</h1>
        <p className="dashboard-subtitle">Kelola data mitra statistik BPS</p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard
          title="Total Mitra"
          value={total}
          color="blue"
          icon={<Users size={20} />}
        />

        <StatCard
          title="Bank Terdaftar"
          value={bankTerdaftar}
          color="purple"
          icon={<Landmark size={20} />}
        />
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Daftar Mitra Statistik
          </h2>

          <Link
            to="/admin/mitra/create"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
          >
            Tambah Mitra
          </Link>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Nama Mitra</th>
                  <th className="px-4 py-3 text-left">NIK</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">No. Telepon</th>
                  <th className="px-4 py-3 text-left">Nama Bank</th>
                  <th className="px-4 py-3 text-left">No. Rekening</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.map((m, index) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold">
                        {m.nama_mitra.charAt(0)}
                      </div>
                      {m.nama_mitra}
                    </td>

                    <td className="px-4 py-3">{m.nik ?? "-"}</td>
                    <td className="px-4 py-3">{m.email ?? "-"}</td>
                    <td className="px-4 py-3">{m.no_hp ?? "-"}</td>
                    <td className="px-4 py-3">{m.bank ?? "-"}</td>
                    <td className="px-4 py-3">{m.no_rekening ?? "-"}</td>

                    <td className="px-4 py-3 flex gap-2">
                      <Link
                        to={`/admin/mitra/${m.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <button className="text-red-500 hover:underline">
                        Hapus
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: "blue" | "purple";
  icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>

      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>
    </motion.div>
  );
}
