import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { Briefcase, CalendarCheck } from "lucide-react";

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tahun: number;
  satuan?: string;
  tarif_per_satuan: number;
  mataAnggaran?: {
    kode_anggaran: string;
  };
}

interface ApiErrorResponse {
  message?: string;
}

export default function KegiatanList() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Kegiatan[]>("/admin/kegiatan"); // 🔥 untouched
      setData(res.data);
    } catch {
      setError("Gagal memuat data kegiatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kegiatan ini?")) return;

    try {
      await api.delete(`/admin/kegiatan/${id}`);
      setData((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      let message = "Kegiatan tidak dapat dihapus";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      alert(message);
    }
  };

  if (loading) return <p className="text-muted">Memuat data kegiatan…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const total = data.length;
  const tahunAktif = new Date().getFullYear();
  const kegiatanTahunIni = data.filter((k) => k.tahun === tahunAktif).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-container space-y-8"
    >
      {/* HEADER */}
      <div>
        <h1 className="dashboard-title">Data Kegiatan</h1>
        <p className="dashboard-subtitle">
          Kelola kegiatan yang digunakan dalam sistem SPK
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Total Kegiatan"
          value={total}
          color="blue"
          icon={<Briefcase size={20} />}
        />

        <StatCard
          title="Tahun Ini"
          value={kegiatanTahunIni}
          color="green"
          icon={<CalendarCheck size={20} />}
        />
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Daftar Kegiatan</h2>

          {/* ✅ FIXED ROUTE */}
          <Link
            to="/admin/kegiatan/create"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
          >
            Tambah Kegiatan
          </Link>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border">
          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Jenis</th>
                  <th className="px-4 py-3 text-left">Tahun</th>
                  <th className="px-4 py-3 text-left">Satuan</th>
                  <th className="px-4 py-3 text-left">Tarif</th>
                  <th className="px-4 py-3 text-left">Mata Anggaran</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center">
                      Belum ada data kegiatan
                    </td>
                  </tr>
                ) : (
                  data.map((k, index) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {k.nama_kegiatan}
                      </td>

                      <td className="px-4 py-3">{k.jenis_kegiatan}</td>

                      <td className="px-4 py-3">{k.tahun}</td>

                      <td className="px-4 py-3">{k.satuan ?? "-"}</td>

                      <td className="px-4 py-3">
                        Rp {k.tarif_per_satuan.toLocaleString("id-ID")}
                      </td>

                      <td className="px-4 py-3">
                        {k.mataAnggaran?.kode_anggaran ?? "-"}
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        {/* ✅ FIXED ROUTE */}
                        <Link
                          to={`/admin/kegiatan/${k.id}/edit`}
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
  color: "blue" | "green" | "purple";
  icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
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
