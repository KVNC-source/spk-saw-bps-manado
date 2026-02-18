import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";

interface SpkItem {
  id: number;
  nama_kegiatan: string;
  volume: number;
  harga_satuan: number;
  nilai: number;
  status?: "PENDING" | "APPROVED" | "REJECTED"; // 🔥 NEW
}

interface SpkDetail {
  id: number;
  nomor_spk: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_honorarium: number;
  kegiatan: SpkItem[];
  admin_note?: string | null;
}

export default function KetuaSpkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spk, setSpk] = useState<SpkDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/ketua/spk");
      return;
    }

    fetchData(id);
  }, [id]);

  const fetchData = async (spkId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/ketua/spk/${spkId}`);
      setSpk(res.data);
    } catch {
      alert("Gagal mengambil data SPK");
      navigate("/ketua/spk");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm("Batalkan SPK ini?")) return;

    await api.patch(`/ketua/spk/${id}/cancel`);
    navigate("/ketua/spk");
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-400",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-gray-500",
  };

  if (loading || !spk) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* BACK + TITLE */}
      <div>
        <button
          onClick={() => navigate("/ketua/spk")}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Detail SPK
        </button>
        <p className="text-xs text-gray-400 mt-1">Informasi lengkap SPK</p>
      </div>

      {/* REJECTED ALERT */}
      {spk.status === "REJECTED" && spk.admin_note && (
        <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
          <div className="font-semibold">⚠ SPK Ditolak</div>
          <div className="text-sm mt-1">Catatan Admin: {spk.admin_note}</div>
        </div>
      )}

      {/* MAIN SPK CARD */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{spk.nomor_spk}</h2>
            <p className="text-sm text-gray-500">
              Periode: {new Date(spk.tanggal_mulai).toLocaleDateString("id-ID")}{" "}
              - {new Date(spk.tanggal_selesai).toLocaleDateString("id-ID")}
            </p>
          </div>

          <span
            className={`px-3 py-1 text-xs rounded-full text-white ${
              statusColor[spk.status]
            }`}
          >
            {spk.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6 text-sm">
          <div>
            <p className="text-gray-500">Tanggal Dibuat</p>
            <p className="font-medium">
              {new Date(spk.tanggal_mulai).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Total Nilai</p>
            <p className="font-semibold text-red-600">
              Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
            </p>
          </div>

          {spk.status === "REJECTED" && (
            <div>
              <p className="text-gray-500">Tanggal Ditolak</p>
              <p className="font-medium">
                {new Date().toLocaleDateString("id-ID")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL SPK */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Detail SPK</h3>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium">{spk.status}</p>
          </div>

          <div>
            <p className="text-gray-500">Jumlah Kegiatan</p>
            <p className="font-medium">{spk.kegiatan.length}</p>
          </div>
        </div>
      </div>

      {/* DAFTAR BARANG / JASA */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Daftar Barang/Jasa</h3>

        {spk.kegiatan.length === 0 ? (
          <div className="text-gray-500 text-sm">Tidak ada kegiatan</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Qty</th>
                <th className="text-left p-3">Harga Satuan</th>
                <th className="text-left p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {spk.kegiatan.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.nama_kegiatan}</td>

                  <td className="p-3">{item.volume}</td>

                  <td className="p-3">
                    Rp {item.harga_satuan.toLocaleString("id-ID")}
                  </td>

                  <td className="p-3 font-semibold">
                    Rp {item.nilai.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TOTAL */}
      <div className="text-right text-lg font-bold">
        Total: Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
      </div>

      {/* CANCEL BUTTON */}
      {spk.status === "PENDING" && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Batalkan SPK
          </button>
        </div>
      )}
    </div>
  );
}
