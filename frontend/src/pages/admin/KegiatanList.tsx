import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import api from "../../lib/axios";

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
      const res = await api.get<Kegiatan[]>("/admin/kegiatan");
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

  if (loading) {
    return <p className="text-muted">Memuat data kegiatan…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Data Kegiatan</h1>
          <p className="dashboard-subtitle">
            Daftar kegiatan yang digunakan dalam sistem
          </p>
        </div>

        <a
          href="/admin/dashboard/kegiatan/create"
          className="gov-btn gov-btn-primary"
        >
          + Tambah Kegiatan
        </a>
      </div>

      {/* TABLE */}
      <div className="dashboard-section">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Tahun</th>
              <th>Satuan</th>
              <th>Tarif</th>
              <th>Mata Anggaran</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7}>Belum ada data kegiatan</td>
              </tr>
            ) : (
              data.map((k) => (
                <tr key={k.id}>
                  <td>{k.nama_kegiatan}</td>
                  <td>{k.jenis_kegiatan}</td>
                  <td>{k.tahun}</td>
                  <td>{k.satuan ?? "-"}</td>
                  <td>{k.tarif_per_satuan.toLocaleString("id-ID")}</td>
                  <td>{k.mataAnggaran?.kode_anggaran ?? "-"}</td>
                  <td className="flex gap-2">
                    <a
                      href={`/admin/dashboard/kegiatan/${k.id}/edit`}
                      className="gov-btn gov-btn-secondary"
                    >
                      Edit
                    </a>

                    <button
                      onClick={() => handleDelete(k.id)}
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
