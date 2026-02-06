import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

/* =======================
   TYPES
======================= */

interface Kegiatan {
  id: number;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  satuan: string;
}

interface CreateAlokasiPayload {
  tahun: number;
  bulan: number;
  kegiatan_id: number;
  volume: number;
  tarif: number;
}

/* =======================
   COMPONENT
======================= */

export default function InputAlokasiPage() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(
    null,
  );

  const [form, setForm] = useState<CreateAlokasiPayload>({
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    kegiatan_id: 0,
    volume: 0,
    tarif: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  /* =======================
     FETCH KEGIATAN
  ======================= */

  useEffect(() => {
    api
      .get<Kegiatan[]>("/kegiatan")
      .then((res) => setKegiatanList(res.data))
      .catch(() => {
        setError(true);
        setMessage("Gagal memuat data kegiatan");
      });
  }, []);

  /* =======================
     SUBMIT
  ======================= */

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    setError(false);

    try {
      await api.post("/spk/alokasi", form);
      setMessage("Alokasi berhasil disimpan sebagai DRAFT");

      setForm({
        ...form,
        volume: 0,
        tarif: 0,
      });
    } catch (err: unknown) {
      setError(true);

      if (err instanceof Error) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Gagal menyimpan alokasi",
        );
      } else {
        setMessage("Gagal menyimpan alokasi");
      }
    } finally {
      setLoading(false);
    }
  };

  const total = form.volume * form.tarif;

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="page-container">
      <h1>Input Alokasi Pekerjaan</h1>
      <p className="text-muted">
        Data ini akan digunakan sebagai dasar pembuatan Surat Perintah Kerja
        (SPK)
      </p>

      <div className="alokasi-grid mt-32">
        {/* =====================
            DATA KEGIATAN
        ===================== */}
        <div className="form-card">
          <h3 className="form-section-title">Data Kegiatan</h3>

          <label>Kegiatan</label>
          <select
            value={form.kegiatan_id}
            onChange={(e) => {
              const id = Number(e.target.value);
              const kegiatan = kegiatanList.find((k) => k.id === id) ?? null;

              setSelectedKegiatan(kegiatan);
              setForm({ ...form, kegiatan_id: id });
            }}
          >
            <option value={0}>— Pilih Kegiatan —</option>
            {kegiatanList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kegiatan}
              </option>
            ))}
          </select>

          {selectedKegiatan && (
            <div className="kegiatan-preview">
              <p>
                <strong>Jenis Pekerjaan:</strong>{" "}
                {selectedKegiatan.jenis_kegiatan}
              </p>
              <p>
                <strong>Satuan:</strong> {selectedKegiatan.satuan}
              </p>
            </div>
          )}
        </div>

        {/* =====================
            DATA ALOKASI
        ===================== */}
        <div className="form-card">
          <h3 className="form-section-title">Data Alokasi</h3>

          <label>Tahun</label>
          <input
            type="number"
            value={form.tahun}
            onChange={(e) =>
              setForm({ ...form, tahun: Number(e.target.value) })
            }
          />

          <label>Bulan</label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.bulan}
            onChange={(e) =>
              setForm({ ...form, bulan: Number(e.target.value) })
            }
          />

          <label>Volume</label>
          <input
            type="number"
            min={0}
            value={form.volume}
            onChange={(e) =>
              setForm({ ...form, volume: Number(e.target.value) })
            }
          />

          <label>Tarif (Rp)</label>
          <input
            type="number"
            min={0}
            value={form.tarif}
            onChange={(e) =>
              setForm({ ...form, tarif: Number(e.target.value) })
            }
          />

          <div className="total-preview">
            Total Honorarium:{" "}
            <strong>Rp {total.toLocaleString("id-ID")}</strong>
          </div>
        </div>
      </div>

      {/* =====================
          ACTIONS
      ===================== */}
      <div className="form-actions">
        <button onClick={submit} disabled={loading || form.kegiatan_id === 0}>
          {loading ? "Menyimpan…" : "Simpan Alokasi"}
        </button>

        {message && (
          <p className={`info-text ${error ? "error" : "success"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
