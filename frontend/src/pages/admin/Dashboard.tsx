import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboardSummary,
  fetchMonthlyAbsorption,
  type DashboardSummary,
} from "../../services/dashboardApi";
import { Users, Briefcase, CheckCircle, Wallet } from "lucide-react";

/* =========================================================
   DASHBOARD — ONE SCREEN + ANIMATION
========================================================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<number[]>([]);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    fetchDashboardSummary()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data dashboard");
      });

    fetchMonthlyAbsorption(currentYear)
      .then((res) => {
        if (!cancelled) {
          setMonthlyData(res.map((m) => m.total));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return <div className="text-gray-500">Memuat data dashboard...</div>;
  }

  if (error || !data) {
    return <div className="text-red-600">{error ?? "Data tidak tersedia"}</div>;
  }

  type KpiColor = "blue" | "green" | "orange" | "purple";

  const kpiItems: {
    title: string;
    value: string | number;
    color: KpiColor;
    icon: React.ReactNode;
  }[] = [
    {
      title: "Total Mitra",
      value: data.totalMitra,
      color: "blue",
      icon: <Users size={18} />,
    },
    {
      title: "Total Kegiatan",
      value: data.totalKegiatan,
      color: "orange",
      icon: <Briefcase size={18} />,
    },
    {
      title: "Total Approved",
      value: data.alokasiApproved,
      color: "green",
      icon: <CheckCircle size={18} />,
    },
    {
      title: "Total Anggaran",
      value: `Rp ${data.totalAnggaran.toLocaleString("id-ID")}`,
      color: "purple",
      icon: <Wallet size={18} />,
    },
  ];

  const MAX_PER_MITRA = 3_500_000;
  const maxValue = data.totalMitra * MAX_PER_MITRA || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-[calc(100vh-68px)] flex flex-col gap-4 overflow-hidden"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-[20px] font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-xs text-gray-500">
          Sistem Pengisian Beban Kerja Mitra – BPS
        </p>
      </div>

      {/* ================= KPI SECTION ================= */}
      <div className="grid grid-cols-4 gap-4">
        {kpiItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <KpiCard {...item} />
          </motion.div>
        ))}
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* ================= CHART ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 bg-white rounded-xl p-4 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Monthly Budget Absorption
            </h2>

            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 text-xs font-medium rounded-md bg-[#0f4c81]/10 text-[#0f4c81] border border-[#0f4c81]/20">
                Tahun {currentYear}
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-2">
            {monthlyData.map((value, i) => {
              const heightPercent = Math.min((value / maxValue) * 100, 100);

              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="flex-1 bg-orange-500 rounded-t-sm relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    Rp {value.toLocaleString("id-ID")}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Month Labels */}
          <div className="flex justify-between text-[10px] text-gray-500 mt-2">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "Mei",
              "Jun",
              "Jul",
              "Agu",
              "Sep",
              "Okt",
              "Nov",
              "Des",
            ].map((m) => (
              <span key={m} className="flex-1 text-center">
                {m}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-2 text-right">
            Kapasitas Maksimum: Rp {maxValue.toLocaleString("id-ID")}
          </p>
        </motion.div>

        {/* ================= RECENT ACTIVITIES ================= */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm flex flex-col"
        >
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Recent Activities
          </h2>

          <div className="flex-1 space-y-3">
            {data.aktivitasTerakhir.slice(0, 4).map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                <ActivityItem activity={a} />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => navigate("/admin/spk/approval")}
            className="mt-3 text-xs font-medium text-[#0f4c81] hover:underline transition"
          >
            Lihat Semua Aktivitas →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  color: "blue" | "orange" | "green" | "purple";
  icon: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition">
      <div
        className={`w-9 h-9 rounded-md flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  activity,
}: {
  activity: {
    kegiatan: string;
    mitra: string;
    status: string;
  };
}) {
  const statusStyles: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs">
        ✓
      </div>

      <div>
        <p className="text-xs font-medium text-gray-800">{activity.kegiatan}</p>
        <p className="text-[11px] text-gray-500">{activity.mitra}</p>

        <span
          className={`inline-block mt-1 px-2 py-[2px] text-[10px] font-medium rounded-full ${
            statusStyles[activity.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {activity.status}
        </span>
      </div>
    </div>
  );
}
