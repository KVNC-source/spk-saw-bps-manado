import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "@/lib/axios";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

interface Activity {
  id: number;
  nomor_spk: string;
  status: string;
  created_at: string;
}

interface Summary {
  totalSpk: number;
  approved: number;
  pending: number;
  recentActivities: Activity[];
}

export default function KetuaDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Reuse auth context

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/ketua/spk/summary");
        setSummary(res.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading || !summary) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
        <p className="text-sm text-gray-500">Kelola dan pantau SPK tim Anda</p>
      </div>

      {/* WELCOME BANNER */}
      <div className="bg-blue-600 text-white p-6 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            Selamat Datang, {user?.name ?? "Ketua Tim"}!
          </h2>
          <p className="text-sm opacity-90">
            Kelola SPK tim Anda dengan mudah dan efisien
          </p>
        </div>
        <Users size={48} className="opacity-30" />
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <FileText className="text-blue-600" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold mt-2">{summary.totalSpk}</p>
          <p className="text-xs text-gray-500">Total SPK</p>
        </div>

        <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <Clock className="text-yellow-600" />
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <p className="text-2xl font-bold mt-2">{summary.pending}</p>
          <p className="text-xs text-gray-500">SPK menunggu persetujuan</p>
        </div>

        <div className="bg-green-50 p-5 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <CheckCircle className="text-green-600" />
            <span className="text-sm text-gray-400">Approved</span>
          </div>
          <p className="text-2xl font-bold mt-2">{summary.approved}</p>
          <p className="text-xs text-gray-500">SPK disetujui</p>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Aktivitas Terbaru</h3>
          <button
            onClick={() => navigate("/ketua/spk")}
            className="text-sm text-blue-600"
          >
            Lihat Semua
          </button>
        </div>

        <div className="space-y-3">
          {summary.recentActivities.length === 0 && (
            <p className="text-sm text-gray-500">
              Tidak ada aktivitas terbaru.
            </p>
          )}

          {summary.recentActivities.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="text-sm font-medium">{item.nomor_spk}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : item.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
