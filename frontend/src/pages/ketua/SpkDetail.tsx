import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

interface SpkItem {
  id: number;
  nama_kegiatan: string;
  volume: number;
  harga_satuan: number;
  nilai: number;
}

interface SpkDetail {
  id: number;
  nomor_spk: string;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tanggal_perjanjian?: string;
  tanggal_pembayaran?: string;
  total_honorarium: number;
  kegiatan: SpkItem[];
}

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
}

export default function KetuaSpkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spk, setSpk] = useState<SpkDetail | null>(null);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(false);

  const [newKegiatanId, setNewKegiatanId] = useState<number | "">("");
  const [newVolume, setNewVolume] = useState<number>(1);

  const isEditable = spk?.status === "PENDING" || spk?.status === "REJECTED";

  /* =========================================
     LOAD DATA
  ========================================= */

  const fetchData = async () => {
    const [spkRes, kegiatanRes] = await Promise.all([
      api.get(`/ketua/spk/${id}`),
      api.get("/kegiatan"),
    ]);

    setSpk(spkRes.data);
    setKegiatanList(kegiatanRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* =========================================
     ADD ITEM
  ========================================= */

  const handleAddItem = async () => {
    if (!newKegiatanId) {
      alert("Pilih kegiatan terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/ketua/spk/${id}/items`, {
        kegiatan_id: newKegiatanId,
        volume: newVolume,
      });

      setNewKegiatanId("");
      setNewVolume(1);
      await fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      alert(error.response?.data?.message || "Gagal menambah item");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     DELETE ITEM
  ========================================= */

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Hapus item ini?")) return;

    try {
      await api.delete(`/ketua/spk/items/${itemId}`);
      await fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      alert(error.response?.data?.message || "Gagal menghapus item");
    }
  };

  /* =========================================
     UPDATE DATES
  ========================================= */

  const handleUpdateDates = async () => {
    try {
      await api.patch(`/ketua/spk/${id}/dates`, {
        tanggal_perjanjian: spk?.tanggal_perjanjian,
        tanggal_pembayaran: spk?.tanggal_pembayaran,
      });

      alert("Tanggal berhasil diperbarui");
      await fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      alert(error.response?.data?.message || "Gagal update tanggal");
    }
  };

  /* =========================================
     CANCEL
  ========================================= */

  const handleCancel = async () => {
    if (!confirm("Batalkan SPK ini?")) return;

    await api.patch(`/ketua/spk/${id}/cancel`);
    navigate("/ketua/spk");
  };

  /* =========================================
     STATUS BADGE
  ========================================= */

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-400",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-gray-500",
  };

  if (!spk) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SPK #{spk.nomor_spk}</h1>

        <span
          className={`px-3 py-1 text-white rounded ${statusColor[spk.status]}`}
        >
          {spk.status}
        </span>
      </div>

      {/* ITEMS */}
      <div className="border rounded p-4">
        <h2 className="font-semibold mb-4">Daftar Kegiatan</h2>

        {spk.kegiatan.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              {item.nama_kegiatan} — {item.volume} x Rp{" "}
              {item.harga_satuan.toLocaleString("id-ID")}
            </div>

            {isEditable && (
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-600"
              >
                Hapus
              </button>
            )}
          </div>
        ))}

        {/* ADD ITEM */}
        {isEditable && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <select
              value={newKegiatanId}
              onChange={(e) => setNewKegiatanId(Number(e.target.value))}
              className="border p-2 rounded"
            >
              <option value="">Pilih Kegiatan</option>
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kegiatan}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={newVolume}
              onChange={(e) => setNewVolume(Number(e.target.value))}
              className="border p-2 rounded"
            />

            <button
              onClick={handleAddItem}
              disabled={loading}
              className="bg-blue-600 text-white rounded"
            >
              Tambah
            </button>
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="text-right font-bold text-lg">
        Total: Rp {spk.total_honorarium.toLocaleString("id-ID")}
      </div>

      {/* LEGAL DATES */}
      {isEditable && (
        <div className="border rounded p-4 space-y-4">
          <h2 className="font-semibold">Tanggal Legal</h2>

          <input
            type="date"
            value={spk.tanggal_perjanjian || ""}
            onChange={(e) =>
              setSpk({
                ...spk,
                tanggal_perjanjian: e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            value={spk.tanggal_pembayaran || ""}
            onChange={(e) =>
              setSpk({
                ...spk,
                tanggal_pembayaran: e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <button
            onClick={handleUpdateDates}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Simpan Tanggal
          </button>
        </div>
      )}

      {/* CANCEL BUTTON */}
      {spk.status === "PENDING" && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Batalkan SPK
          </button>
        </div>
      )}
    </div>
  );
}
