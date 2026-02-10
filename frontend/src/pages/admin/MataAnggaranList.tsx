import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import api from "../../lib/axios";

interface MataAnggaran {
  id: number;
  kode_anggaran: string;
  nama_anggaran: string;
  tahun: number;
  is_active: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

export default function MataAnggaranList() {
  const [data, setData] = useState<MataAnggaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH DATA (STRICTMODE SAFE) ================= */
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await api.get<MataAnggaran[]>("/admin/mata-anggaran");
        if (isMounted) {
          setData(res.data);
        }
      } catch {
        if (isMounted) {
          setError("Gagal memuat data mata anggaran");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    if (!confirm("Hapus mata anggaran ini?")) return;

    try {
      await api.delete(`/admin/mata-anggaran/${id}`);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch (err: unknown) {
      let message = "Gagal menghapus mata anggaran";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      alert(message);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return <p className="text-muted">Memuat data mata anggaran…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Data Mata Anggaran</h1>
          <p className="dashboard-subtitle">
            Daftar mata anggaran yang tersedia dalam sistem
          </p>
        </div>

        <a
          href="/admin/dashboard/mata-anggaran/create"
          className="gov-btn gov-btn-primary"
        >
          + Tambah Mata Anggaran
        </a>
      </div>

      {/* TABLE */}
      <div className="dashboard-section">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Tahun</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5}>Belum ada data mata anggaran</td>
              </tr>
            ) : (
              data.map((m) => (
                <tr key={m.id}>
                  <td>{m.kode_anggaran}</td>
                  <td>{m.nama_anggaran}</td>
                  <td>{m.tahun}</td>
                  <td>{m.is_active ? "Aktif" : "Nonaktif"}</td>
                  <td className="flex gap-2">
                    <a
                      href={`/admin/dashboard/mata-anggaran/${m.id}/edit`}
                      className="gov-btn gov-btn-secondary"
                    >
                      Edit
                    </a>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="gov-btn gov-btn-danger"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
