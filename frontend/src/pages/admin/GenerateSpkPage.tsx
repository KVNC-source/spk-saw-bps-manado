import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

/* =======================
   TYPES
======================= */

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

/* =======================
   COMPONENT
======================= */

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

  /* =======================
     FETCH DATA
  ======================= */

  useEffect(() => {
    api.get<Mitra[]>("/admin/mitra").then((res) => setMitraList(res.data));
    api.get<Kegiatan[]>("/kegiatan").then((res) => setKegiatanList(res.data));
  }, []);

  /* =======================
     HELPERS
  ======================= */

  const getTarif = (id: number) =>
    kegiatanList.find((k) => k.id === id)?.tarif_per_satuan ?? 0;

  const totalHonorarium = kegiatanInputs.reduce(
    (sum, r) => sum + r.volume * getTarif(r.kegiatan_id),
    0,
  );

  /* =======================
     SUBMIT
  ======================= */

  const submit = async () => {
    if (
      mitraId === 0 ||
      kegiatanInputs.some((k) => k.kegiatan_id === 0 || k.volume <= 0)
    ) {
      setError(true);
      setMessage("Lengkapi mitra dan semua kegiatan");
      return;
    }

    setLoading(true);
    setError(false);
    setMessage(null);

    try {
      await api.post("/spk/manual", {
        mitra_id: mitraId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        kegiatan: kegiatanInputs,
      });

      setMessage("SPK berhasil disimpan");

      setMitraId(0);
      setKegiatanInputs([{ kegiatan_id: 0, volume: 0 }]);
      setTanggalMulai("");
      setTanggalSelesai("");
    } catch (err: unknown) {
      setError(true);
      const axiosError = err as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Gagal menyimpan SPK");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="page-container">
      <h1>Generate SPK</h1>
      <p>Satu mitra dapat memiliki lebih dari satu kegiatan dalam satu SPK.</p>

      <div className="alokasi-grid mt-32">
        {/* =====================
            DATA MITRA
        ===================== */}
        <div className="form-card">
          <h3 className="form-section-title">Data Mitra</h3>

          <label>Mitra</label>
          <select
            value={mitraId}
            onChange={(e) => setMitraId(Number(e.target.value))}
          >
            <option value={0}>— Pilih Mitra —</option>
            {mitraList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_mitra}
              </option>
            ))}
          </select>
        </div>

        {/* =====================
            PERIODE SPK
        ===================== */}
        <div className="form-card">
          <h3 className="form-section-title">Periode SPK</h3>

          <label>Tanggal Mulai</label>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
          />

          <label>Tanggal Selesai</label>
          <input
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
          />
        </div>

        {/* =====================
            DATA KEGIATAN (FULL WIDTH)
        ===================== */}
        <div className="form-card grid-span-2">
          <h3 className="form-section-title">Data Kegiatan</h3>

          {kegiatanInputs.map((row, index) => {
            const tarif = getTarif(row.kegiatan_id);
            const subtotal = row.volume * tarif;

            return (
              <div key={index} className="kegiatan-preview">
                <label>Kegiatan</label>
                <select
                  value={row.kegiatan_id}
                  onChange={(e) => {
                    const copy = [...kegiatanInputs];
                    copy[index].kegiatan_id = Number(e.target.value);
                    setKegiatanInputs(copy);
                  }}
                >
                  <option value={0}>— Pilih Kegiatan —</option>
                  {kegiatanList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kegiatan}
                    </option>
                  ))}
                </select>

                <label>Volume</label>
                <input
                  type="number"
                  min={0}
                  value={row.volume}
                  onChange={(e) => {
                    const copy = [...kegiatanInputs];
                    copy[index].volume = Number(e.target.value);
                    setKegiatanInputs(copy);
                  }}
                />

                <div className="total-preview">
                  Subtotal: Rp {subtotal.toLocaleString("id-ID")}
                </div>

                {kegiatanInputs.length > 1 && (
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() =>
                      setKegiatanInputs(
                        kegiatanInputs.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Hapus Kegiatan
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() =>
              setKegiatanInputs([
                ...kegiatanInputs,
                { kegiatan_id: 0, volume: 0 },
              ])
            }
          >
            + Tambah Kegiatan
          </button>
        </div>

        {/* =====================
            RINGKASAN (FULL WIDTH)
        ===================== */}
        <div className="form-card grid-span-2">
          <h3 className="form-section-title">Ringkasan Honorarium</h3>

          <div className="total-preview">
            Total Honorarium: Rp {totalHonorarium.toLocaleString("id-ID")}
          </div>

          <div className="form-actions">
            <button onClick={submit} disabled={loading}>
              {loading ? "Menyimpan…" : "Simpan SPK"}
            </button>

            {message && (
              <p className={`info-text ${error ? "error" : "success"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
