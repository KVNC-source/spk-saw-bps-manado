import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
}

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ CORRECT BACKEND PATH
      const res = await api.get<Mitra[]>("/admin/mitra");
      setData(res.data);
    } catch {
      setError("Gagal memuat data mitra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus mitra ini?")) return;

    try {
      // ✅ CORRECT BACKEND PATH
      await api.delete(`/admin/mitra/${id}`);
      setData((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      let message = "Mitra tidak dapat dihapus karena sudah digunakan";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      alert(message);
    }
  };

  if (loading) return <p className="text-muted">Memuat data mitra…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Data Mitra</h1>
          <p className="dashboard-subtitle">
            Daftar mitra yang terdaftar dalam sistem
          </p>
        </div>

        <a
          href="/admin/dashboard/mitra/create"
          className="gov-btn gov-btn-primary"
        >
          + Tambah Mitra
        </a>
      </div>

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
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7}>Belum ada data mitra</td>
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
                  <td className="flex gap-2">
                    <a
                      href={`/admin/dashboard/mitra/${m.id}/edit`}
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
