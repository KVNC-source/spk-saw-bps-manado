import { useEffect, useState } from "react";
import { getMitraDashboard } from "../../services/mitra.service";

interface MitraDashboardSummary {
  totalAlokasi: number;
  alokasiDraft: number;
  alokasiApproved: number;
  alokasiUsed: number;
}

export default function MitraDashboard() {
  const [data, setData] = useState<MitraDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMitraDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard error:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Memuat dashboard…</p>;
  if (!data) return <p className="text-muted">Data tidak tersedia</p>;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Mitra</h1>
        <p className="dashboard-subtitle">
          Ringkasan alokasi dan penggunaan SPK Anda
        </p>
      </div>

      {/* KPI GRID */}
      <div className="dashboard-kpi">
        <div className="kpi-card">
          <div className="kpi-label">Total Alokasi</div>
          <div className="kpi-value">{data.totalAlokasi}</div>
          <div className="kpi-meta">Seluruh alokasi diterima</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Draft</div>
          <div className="kpi-value">{data.alokasiDraft}</div>
          <div className="kpi-meta">Belum diajukan</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Approved</div>
          <div className="kpi-value">{data.alokasiApproved}</div>
          <div className="kpi-meta">Disetujui BPS</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Digunakan SPK</div>
          <div className="kpi-value">{data.alokasiUsed}</div>
          <div className="kpi-meta">Sudah terbit SPK</div>
        </div>
      </div>

      {/* SECTION PANEL (READY FOR TABLE / NEXT CONTENT) */}
      <div className="dashboard-section mt-32">
        <div className="section-header">
          <h2>Informasi Alokasi</h2>
          <p>Ringkasan status alokasi kerja sama</p>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="badge badge-draft">Draft</span>
              </td>
              <td>{data.alokasiDraft}</td>
            </tr>
            <tr>
              <td>
                <span className="badge badge-success">Approved</span>
              </td>
              <td>{data.alokasiApproved}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
