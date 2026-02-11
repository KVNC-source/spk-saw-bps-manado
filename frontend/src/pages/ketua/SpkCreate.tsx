import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

interface Mitra {
  id: number;
  nama_mitra: string;
}

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
  tarif_per_satuan: number;
}

interface KegiatanItem {
  kegiatan_id: number;
  volume: number;
}

export default function KetuaSpkCreate() {
  const navigate = useNavigate();

  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);

  const [mitraId, setMitraId] = useState<number | "">("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [items, setItems] = useState<KegiatanItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {
    const fetchData = async () => {
      const [mitraRes, kegiatanRes] = await Promise.all([
        api.get("/ketua/spk/mitra-list"),
        api.get("/ketua/spk/kegiatan-list"),
      ]);

      setMitraList(mitraRes.data);
      setKegiatanList(kegiatanRes.data);
    };

    fetchData();
  }, []);

  /* =========================================
     ADD ITEM
  ========================================= */

  const addItem = () => {
    setItems([...items, { kegiatan_id: 0, volume: 1 }]);
  };

  const updateItem = (
    index: number,
    field: keyof KegiatanItem,
    value: number,
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  /* =========================================
     TOTAL PREVIEW
  ========================================= */

  const totalPreview = items.reduce((sum, item) => {
    const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id);
    if (!kegiatan) return sum;

    return sum + kegiatan.tarif_per_satuan * item.volume;
  }, 0);

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mitraId || !tanggalMulai || !tanggalSelesai) {
      alert("Semua field wajib diisi");
      return;
    }

    if (items.length === 0) {
      alert("Minimal satu kegiatan harus dipilih");
      return;
    }

    try {
      setLoading(true);

      await api.post("/ketua/spk", {
        mitra_id: mitraId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        kegiatan: items,
      });

      navigate("/ketua/spk");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      alert(error.response?.data?.message || "Gagal membuat SPK");
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat SPK Baru</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mitra */}
        <div>
          <label className="block mb-2 font-medium">Pilih Mitra</label>
          <select
            value={mitraId}
            onChange={(e) => setMitraId(Number(e.target.value))}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Mitra --</option>
            {mitraList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_mitra}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Tanggal Mulai</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Tanggal Selesai</label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Kegiatan */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Kegiatan</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              + Tambah
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-3">
              <select
                value={item.kegiatan_id}
                onChange={(e) =>
                  updateItem(index, "kegiatan_id", Number(e.target.value))
                }
                className="border p-2 rounded"
              >
                <option value={0}>-- Pilih Kegiatan --</option>
                {kegiatanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kegiatan}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={item.volume}
                onChange={(e) =>
                  updateItem(index, "volume", Number(e.target.value))
                }
                className="border p-2 rounded"
              />

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white rounded"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        {/* Total Preview */}
        <div className="text-right font-semibold">
          Total Perkiraan: Rp {totalPreview.toLocaleString("id-ID")}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ketua/spk")}
            className="px-4 py-2 border rounded"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan SPK"}
          </button>
        </div>
      </form>
    </div>
  );
}
