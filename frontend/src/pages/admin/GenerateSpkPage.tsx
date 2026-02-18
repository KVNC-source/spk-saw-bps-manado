import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

/* ================= TYPES ================= */

interface Mitra {
  id: number;
  nama_mitra: string;
  alamat: string;
}

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
  satuan: string;
  tarif_per_satuan: number;
}

interface KegiatanInput {
  kegiatan_id: number;
  volume: number;
}

/* ================= COMPONENT ================= */

export default function GenerateSPKPage() {
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);

  const [mitraId, setMitraId] = useState<number>(0);
  const [kegiatanInputs, setKegiatanInputs] = useState<KegiatanInput[]>([
    { kegiatan_id: 0, volume: 0 },
  ]);

  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    api.get<Mitra[]>("/admin/mitra").then((res) => setMitraList(res.data));
    api.get<Kegiatan[]>("/kegiatan").then((res) => setKegiatanList(res.data));
  }, []);

  /* ================= AUTO CLEAR ERROR ================= */

  useEffect(() => {
    if (error) {
      setError(false);
      setMessage(null);
    }
  }, [mitraId, tanggalMulai, tanggalSelesai, kegiatanInputs]);

  /* ================= HELPERS ================= */

  const getTarif = (id: number) =>
    kegiatanList.find((k) => k.id === id)?.tarif_per_satuan ?? 0;

  const totalHonorarium = kegiatanInputs.reduce(
    (sum, r) => sum + r.volume * getTarif(r.kegiatan_id),
    0,
  );

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (loading) return;

    if (
      mitraId === 0 ||
      tanggalMulai === "" ||
      tanggalSelesai === "" ||
      kegiatanInputs.some((k) => k.kegiatan_id === 0 || k.volume <= 0)
    ) {
      setError(true);
      setMessage("Lengkapi mitra, periode, dan semua kegiatan.");
      return;
    }

    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setError(true);
      setMessage("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage(null);

    try {
      const res = await api.post("/spk/manual", {
        mitra_id: mitraId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        kegiatan: kegiatanInputs,
      });

      if (res.data.alreadyExists) {
        setMessage("Kegiatan berhasil ditambahkan ke SPK yang sudah ada.");
        setError(false);

        setMitraId(0);
        setTanggalMulai("");
        setTanggalSelesai("");
        setKegiatanInputs([{ kegiatan_id: 0, volume: 0 }]);

        return;
      }

      setMessage("SPK berhasil disimpan.");
      setMitraId(0);
      setTanggalMulai("");
      setTanggalSelesai("");
      setKegiatanInputs([{ kegiatan_id: 0, volume: 0 }]);
    } catch (err: unknown) {
      setError(true);
      const axiosError = err as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Gagal menyimpan SPK");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="dashboard-container space-y-8"
      >
        {/* HEADER */}
        <div>
          <h1 className="dashboard-title">Generate SPK</h1>
          <p className="dashboard-subtitle">
            Buat Surat Perintah Kerja untuk Mitra Statistik
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-8">
          {/* LEFT CARD */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <h2 className="font-semibold text-gray-800">
              Informasi Mitra & Periode
            </h2>

            <select
              value={mitraId}
              onChange={(e) => setMitraId(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={0}>Pilih Mitra...</option>
              {mitraList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_mitra}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Detail Kegiatan</h2>

              <button
                onClick={() =>
                  setKegiatanInputs([
                    ...kegiatanInputs,
                    { kegiatan_id: 0, volume: 0 },
                  ])
                }
                className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
              >
                Tambah
              </button>
            </div>

            <AnimatePresence>
              {kegiatanInputs.map((row, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="border rounded-lg p-4 space-y-3 bg-gray-50"
                >
                  <select
                    value={row.kegiatan_id}
                    onChange={(e) => {
                      const copy = [...kegiatanInputs];
                      copy[index].kegiatan_id = Number(e.target.value);
                      setKegiatanInputs(copy);
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value={0}>Pilih Kegiatan...</option>
                    {kegiatanList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kegiatan}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min={0}
                      placeholder="Volume"
                      value={row.volume}
                      onChange={(e) => {
                        const copy = [...kegiatanInputs];
                        copy[index].volume = Number(e.target.value);
                        setKegiatanInputs(copy);
                      }}
                      className="border rounded-lg px-3 py-2 text-sm bg-white"
                    />

                    <input
                      type="text"
                      readOnly
                      value={`Rp ${(
                        row.volume * getTarif(row.kegiatan_id)
                      ).toLocaleString("id-ID")}`}
                      className="bg-gray-100 border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              key={totalHonorarium}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="bg-blue-700 text-white rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm opacity-80">Total Honorarium</p>
                <p className="text-xl font-semibold">
                  Rp {totalHonorarium.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-sm">{kegiatanInputs.length} Kegiatan</div>
            </motion.div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan SPK"}
            </button>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    error
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* ================= MODAL ================= */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl p-8 w-[420px] space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 text-xl font-bold">!</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  SPK Sudah Ada
                </h3>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                SPK untuk mitra pada bulan tersebut sudah dibuat sebelumnya.
                Apakah Anda ingin menggunakan SPK yang sudah ada?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Batal
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage(
                      "Kegiatan berhasil ditambahkan ke SPK yang sudah ada.",
                    );
                    setError(false);

                    setMitraId(0);
                    setTanggalMulai("");
                    setTanggalSelesai("");
                    setKegiatanInputs([{ kegiatan_id: 0, volume: 0 }]);
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Gunakan SPK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
