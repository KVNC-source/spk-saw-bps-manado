import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

/* =========================================================
   TYPES
========================================================= */

interface Mitra {
  id: number;
  nama_mitra: string;
}

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
  tarif_per_satuan: number;
  satuan?: string;
}

interface KegiatanItem {
  kegiatan_id: number;
  volume: number;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function KetuaSpkCreate() {
  const navigate = useNavigate();

  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);

  const [mitraId, setMitraId] = useState<number | "">("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [items, setItems] = useState<KegiatanItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mitraRes, kegiatanRes] = await Promise.all([
          api.get("/ketua/spk/mitra-list"),
          api.get("/ketua/spk/kegiatan-list"),
        ]);

        setMitraList(mitraRes.data);
        setKegiatanList(kegiatanRes.data);
      } catch {
        alert("Gagal memuat data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     ITEM HANDLING
  ========================================================= */

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
    setItems(items.filter((_, i) => i !== index));
  };

  /* =========================================================
     TOTAL CALCULATION
  ========================================================= */

  const totalPreview = items.reduce((sum, item) => {
    const kegiatan = kegiatanList.find((k) => k.id === item.kegiatan_id);
    if (!kegiatan) return sum;
    return sum + kegiatan.tarif_per_satuan * item.volume;
  }, 0);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mitraId)
      return setNotification({
        type: "error",
        message: "Mitra wajib dipilih",
      });

    if (!tanggalMulai || !tanggalSelesai)
      return setNotification({
        type: "error",
        message: "Tanggal wajib diisi",
      });

    if (items.length === 0)
      return setNotification({
        type: "error",
        message: "Minimal satu kegiatan harus dipilih",
      });

    try {
      setLoading(true);

      await api.post("/ketua/spk", {
        mitra_id: mitraId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        kegiatan: items,
      });

      setNotification({
        type: "success",
        message: "SPK berhasil dibuat ✔",
      });

      setTimeout(() => {
        navigate("/ketua/spk");
      }, 1200);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setNotification({
        type: "error",
        message: error.response?.data?.message || "Gagal membuat SPK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Buat SPK Baru</h1>
          <p className="text-sm text-gray-500">
            Lengkapi formulir untuk membuat Surat Perintah Kerja
          </p>
        </div>

        <button
          onClick={() => navigate("/ketua/spk")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Kembali
        </button>
      </div>

      {/* CARD */}
      {/* NOTIFICATION */}
      {notification && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm border transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {notification.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        {/* ================= INFORMASI DASAR ================= */}
        <div>
          <h2 className="font-semibold mb-4">Informasi Dasar</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* MITRA */}
            <div>
              <label className="block text-sm mb-2">Pilih Mitra *</label>
              <select
                value={mitraId}
                onChange={(e) => setMitraId(Number(e.target.value))}
                className="w-full border p-2 rounded"
              >
                <option value="">Pilih mitra...</option>
                {mitraList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama_mitra}
                  </option>
                ))}
              </select>
            </div>

            {/* NOMOR SPK AUTO */}
            <div>
              <label className="block text-sm mb-2">Nomor SPK</label>
              <input
                disabled
                value="AUTO GENERATED"
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>

            {/* TANGGAL */}
            <div>
              <label className="block text-sm mb-2">Tanggal Mulai *</label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Tanggal Selesai *</label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* ================= KEGIATAN ================= */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Kegiatan</h2>

            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Tambah Kegiatan
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-sm text-gray-500">
              Belum ada kegiatan ditambahkan.
            </p>
          )}

          {items.map((item, index) => {
            const kegiatan = kegiatanList.find(
              (k) => k.id === item.kegiatan_id,
            );
            const subtotal = kegiatan
              ? kegiatan.tarif_per_satuan * item.volume
              : 0;

            return (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 mb-3 items-center"
              >
                <select
                  value={item.kegiatan_id}
                  onChange={(e) =>
                    updateItem(index, "kegiatan_id", Number(e.target.value))
                  }
                  className="border p-2 rounded col-span-2"
                >
                  <option value={0}>Pilih kegiatan...</option>
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

                <div className="text-sm text-gray-600">
                  Rp {subtotal.toLocaleString("id-ID")}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm"
                >
                  Hapus
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= TOTAL ================= */}
        <div className="text-right text-lg font-semibold">
          Total: Rp {totalPreview.toLocaleString("id-ID")}
        </div>

        {/* ================= ACTION ================= */}
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
