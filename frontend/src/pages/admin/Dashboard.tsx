import { useEffect, useState } from "react";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "../../services/dashboardApi";

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardSummary()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ===============================
     DERIVED STATE
  =============================== */

  const loading = !data && !error;

  /* ===============================
     STATES
  =============================== */

  if (loading) {
    return <div className="text-gray-500">Memuat data dashboard...</div>;
  }

  if (error || !data) {
    return <div className="text-red-600">{error ?? "Data tidak tersedia"}</div>;
  }

  /* ===============================
     VIEW
  =============================== */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500">
          Sistem Pengisian Beban Kerja Mitra – BPS
        </p>
      </header>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Mitra"
          value={data.totalMitra}
          subtitle="Terdaftar"
          color="blue"
        />

        <KpiCard
          title="Total Kegiatan"
          value={data.totalKegiatan}
          subtitle="Master Kegiatan"
          color="orange"
        />

        <KpiCard
          title="Total Alokasi (Approved)"
          value={data.alokasiApproved}
          subtitle={`${data.alokasiDraft} Draft`}
          color="green"
        />

        <KpiCard
          title="Total Anggaran"
          value={`Rp ${data.totalAnggaran.toLocaleString("id-ID")}`}
          subtitle="Approved"
          color="purple"
        />
      </section>

      {/* =====================================================
          CHART + RECENT ACTIVITIES
      ====================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =================== CHART =================== */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Monthly Budget Absorption
            </h2>

            <div className="flex gap-2 text-sm">
              <button className="px-3 py-1 rounded border text-gray-500">
                2024
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white">
                2025
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end gap-2">
            {[65, 72, 68, 82, 78, 81, 85, 74, 88, 83, 90, 86].map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-orange-500 rounded-t"
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </div>

        {/* =================== ACTIVITIES =================== */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Recent Activities
          </h2>

          <ul className="space-y-4 text-sm">
            {data.aktivitasTerakhir.length === 0 ? (
              <li className="text-gray-400">Belum ada aktivitas</li>
            ) : (
              data.aktivitasTerakhir.slice(0, 5).map((a, i) => (
                <li key={i} className="space-y-1">
                  <p className="font-medium text-gray-800">{a.kegiatan}</p>
                  <p className="text-xs text-gray-500">{a.mitra}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      a.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : a.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </li>
              ))
            )}
          </ul>

          <button className="mt-4 text-blue-600 text-sm font-medium">
            Lihat Semua Aktivitas →
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   KPI CARD COMPONENT
========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: "blue" | "orange" | "green" | "purple";
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        ●
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
