import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type SpkStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface Spk {
  id: number;
  tahun: number;
  bulan: number;
  nomor_spk: string;
  status: SpkStatus;
  mitra: {
    nama_mitra: string;
  };
  total_honorarium: number;
  tanggal_pembayaran?: string | null;
  created_by_user_name?: string;
}

/* ================= PAGE ================= */

export default function SpkApprovalPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<Spk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpk = async () => {
      try {
        const res = await api.get("/admin/spk");
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message ?? "Gagal mengambil data SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSpk();
  }, []);

  const total = data.length;
  const pending = data.filter((d) => d.status === "PENDING").length;
  const approved = data.filter((d) => d.status === "APPROVED").length;
  const rejected = data.filter((d) => d.status === "REJECTED").length;

  if (loading) return <p className="dashboard-container">Memuat data SPK...</p>;
  if (error) return <p className="dashboard-container text-red-600">{error}</p>;

  return (
    <div className="dashboard-container space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="dashboard-title">Persetujuan SPK</h1>
        <p className="dashboard-subtitle">
          Kelola persetujuan Surat Perjanjian Kerja Mitra
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total SPK" value={total} color="blue" />
        <StatCard title="Pending" value={pending} color="yellow" />
        <StatCard title="Approved" value={approved} color="green" />
        <StatCard title="Rejected" value={rejected} color="red" />
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-3 gap-6">
        {data.map((spk, index) => (
          <motion.div
            key={spk.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{
              y: -6,
              boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
            }}
            className="bg-white rounded-xl shadow-sm p-5 space-y-4 border cursor-pointer"
            onClick={() => navigate(`/admin/spk/${spk.id}`)}
          >
            {/* STATUS + NOMOR */}
            {/* STATUS */}
            <div className="flex justify-between items-center">
              <StatusBadge status={spk.status} />
            </div>

            {/* INFO */}
            <div>
              <h3 className="font-semibold text-gray-800">
                {spk.mitra.nama_mitra}
              </h3>
              <p className="text-sm text-gray-500">
                {spk.bulan}/{spk.tahun}
              </p>
              {spk.created_by_user_name && (
                <p className="text-xs text-blue-700 mt-1">
                  Dibuat oleh {spk.created_by_user_name}
                </p>
              )}
            </div>

            {/* NILAI */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">Total Honorarium</p>
              <p className="text-blue-700 font-semibold text-lg">
                Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
              </p>
            </div>

            {/* PAYMENT STATUS */}
            {spk.tanggal_pembayaran ? (
              <p className="text-xs text-green-600">
                ✔ Bayar: {spk.tanggal_pembayaran}
              </p>
            ) : (
              <p className="text-xs text-yellow-600">
                ⚠ Tanggal pembayaran belum diisi
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "yellow" | "green" | "red";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${colors[color]}`}
      >
        ●
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: SpkStatus }) {
  const base = "px-3 py-1 text-xs rounded-full font-medium";

  if (status === "APPROVED")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>Approved</span>
    );

  if (status === "REJECTED")
    return <span className={`${base} bg-red-100 text-red-600`}>Rejected</span>;

  if (status === "CANCELLED")
    return (
      <span className={`${base} bg-gray-200 text-gray-600`}>Cancelled</span>
    );

  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
  );
}
