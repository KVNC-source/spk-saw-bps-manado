import { useEffect, useState } from "react";
import api from "../../lib/axios";

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

  if (loading) {
    return <p className="text-muted">Memuat data mitra…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Data Mitra</h1>
        <p className="dashboard-subtitle">
          Daftar mitra yang terdaftar dalam sistem
        </p>
      </div>

      {/* TABLE */}
      <div className="dashboard-section">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Nama Mitra</th>
              <th>NIK</th>
              <th>Email</th>
              <th>No. HP</th>
              <th>Bank</th>
              <th>No. Rekening</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6}>Belum ada data mitra</td>
              </tr>
            ) : (
              data.map((m) => (
                <tr key={m.id}>
                  <td>{m.nama_mitra}</td>
                  <td>{m.nik ?? "-"}</td>
                  <td>{m.email ?? "-"}</td>
                  <td>{m.no_hp ?? "-"}</td>
                  <td>{m.bank ?? "-"}</td>
                  <td>{m.no_rekening ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
