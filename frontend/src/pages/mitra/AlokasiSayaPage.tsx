import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface AlokasiSaya {
  id: number;
  kegiatan: {
    nama_kegiatan: string;
  };
  volume: string;
  tarif: string;
  jumlah: string;
  status: "DRAFT" | "APPROVED" | "USED";
}

export default function AlokasiSayaPage() {
  const [data, setData] = useState<AlokasiSaya[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/spk/mitra/alokasi")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-loading">Memuat alokasi…</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">Alokasi Saya</h1>
      <p className="page-subtitle">
        Daftar alokasi kegiatan yang diberikan kepada Anda
      </p>

      <div className="table-wrapper">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Volume</th>
              <th>Tarif</th>
              <th>Jumlah</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  Belum ada alokasi
                </td>
              </tr>
            ) : (
              data.map((a) => (
                <tr key={a.id}>
                  <td className="kegiatan-cell">{a.kegiatan.nama_kegiatan}</td>
                  <td>{Number(a.volume)}</td>
                  <td>{formatRupiah(a.tarif)}</td>
                  <td className="jumlah-cell">{formatRupiah(a.jumlah)}</td>
                  <td>
                    <StatusBadge status={a.status} />
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

/* ================= helpers ================= */

function formatRupiah(value: string | number) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function StatusBadge({ status }: { status: AlokasiSaya["status"] }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
