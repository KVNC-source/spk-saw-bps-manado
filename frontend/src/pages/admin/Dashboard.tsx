import { useEffect, useState } from "react";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "../../services/dashboardApi";

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Memuat data dashboard...</p>;
  if (error || !data) return <p>{error ?? "Data tidak tersedia"}</p>;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Admin</h1>
        <p className="dashboard-subtitle">
          Sistem Pendukung Keputusan & SPK – BPS Kota Manado
        </p>
      </header>

      {/* KPI CARDS */}
      <section className="dashboard-kpi">
        <div className="kpi-card">
          <p className="kpi-label">Total Mitra</p>
          <p className="kpi-value">{data.totalMitra}</p>
          <p className="kpi-meta">Terdaftar</p>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Total Kegiatan</p>
          <p className="kpi-value">{data.totalKegiatan}</p>
          <p className="kpi-meta">Master Kegiatan</p>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Total Alokasi</p>
          <p className="kpi-value">{data.totalAlokasi}</p>
          <p className="kpi-meta">
            {data.alokasiApproved} Approved · {data.alokasiDraft} Draft
          </p>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">Total Anggaran</p>
          <p className="kpi-value">
            Rp {data.totalAnggaran.toLocaleString("id-ID")}
          </p>
          <p className="kpi-meta">
            Approved: Rp {data.totalAnggaranApproved.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">SPK Terakhir</p>
          <p className="kpi-value">{data.lastSpk ? "Tersedia" : "—"}</p>
          <p className="kpi-meta">
            {data.lastSpk ? data.lastSpk.nomor_spk : "Belum ada SPK"}
          </p>
        </div>
      </section>

      {/* ACTIVITY TABLE */}
      <section className="dashboard-section mt-32">
        <div className="section-header">
          <h2>Aktivitas Terakhir</h2>
          <p>Riwayat aktivitas alokasi dan SPK</p>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kegiatan</th>
              <th>Status</th>
              <th>Mitra</th>
            </tr>
          </thead>
          <tbody>
            {data.aktivitasTerakhir.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted">
                  Belum ada aktivitas
                </td>
              </tr>
            ) : (
              data.aktivitasTerakhir.map((a, i) => (
                <tr key={i}>
                  <td>{new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>{a.kegiatan}</td>
                  <td>
                    <span
                      className={`badge ${
                        a.status === "APPROVED"
                          ? "badge-success"
                          : a.status === "DRAFT"
                            ? "badge-warning"
                            : "badge-danger"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>{a.mitra}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
