import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import api from "../../lib/axios";

/* ================= TYPES ================= */

interface KegiatanFormData {
  kode_kegiatan: string;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tahun: number;
  satuan?: string;
  tarif_per_satuan: number;
  mata_anggaran_id: number;
}

interface MataAnggaran {
  id: number;
  kode_anggaran: string;
  nama_anggaran: string;
  tahun: number;
}

interface ApiErrorResponse {
  message?: string;
}

/* ================= COMPONENT ================= */

export default function KegiatanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<KegiatanFormData>({
    kode_kegiatan: "",
    nama_kegiatan: "",
    jenis_kegiatan: "",
    tahun: new Date().getFullYear(),
    satuan: "",
    tarif_per_satuan: 0,
    mata_anggaran_id: 0,
  });

  const [mataAnggaranList, setMataAnggaranList] = useState<MataAnggaran[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  /* ================= FETCH MATA ANGGARAN ================= */
  useEffect(() => {
    api
      .get<MataAnggaran[]>("/admin/mata-anggaran")
      .then((res) => setMataAnggaranList(res.data))
      .catch(() => {});
  }, []);

  /* ================= FETCH EDIT DATA ================= */
  useEffect(() => {
    if (!isEdit || !id) return;

    api
      .get(`/admin/kegiatan/${id}`)
      .then((res) => {
        setForm({
          kode_kegiatan: res.data.kode_kegiatan,
          nama_kegiatan: res.data.nama_kegiatan,
          jenis_kegiatan: res.data.jenis_kegiatan,
          tahun: res.data.tahun,
          satuan: res.data.satuan ?? "",
          tarif_per_satuan: res.data.tarif_per_satuan,
          mata_anggaran_id: res.data.mata_anggaran_id,
        });
      })
      .catch(() => navigate("/admin/kegiatan"));
  }, [id, isEdit, navigate]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "tahun" ||
        name === "tarif_per_satuan" ||
        name === "mata_anggaran_id"
          ? Number(value)
          : value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/admin/kegiatan/${id}`, form);
      } else {
        await api.post("/admin/kegiatan", form);
      }

      setNotification("Data kegiatan berhasil disimpan ✔");

      setTimeout(() => {
        navigate("/admin/kegiatan");
      }, 1200);
    } catch (err: unknown) {
      let message = "Gagal menyimpan kegiatan";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      setNotification(message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="dashboard-container max-w-5xl mx-auto"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="dashboard-title">
          {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
        </h1>
        <p className="dashboard-subtitle">
          Lengkapi informasi kegiatan yang akan digunakan dalam SPK
        </p>
      </div>

      {/* NOTIFICATION */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm"
        >
          {notification}
        </motion.div>
      )}

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 2 COLUMN GRID — EXACT MATCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-700">
                Informasi Kegiatan
              </h3>

              <Field label="Kode Kegiatan *">
                <input
                  name="kode_kegiatan"
                  value={form.kode_kegiatan}
                  onChange={handleChange}
                  required
                  className="gov-input"
                />
              </Field>

              <Field label="Nama Kegiatan *">
                <input
                  name="nama_kegiatan"
                  value={form.nama_kegiatan}
                  onChange={handleChange}
                  required
                  className="gov-input"
                />
              </Field>

              <Field label="Jenis Kegiatan *">
                <input
                  name="jenis_kegiatan"
                  value={form.jenis_kegiatan}
                  onChange={handleChange}
                  required
                  className="gov-input"
                />
              </Field>

              <Field label="Tahun *">
                <input
                  type="number"
                  name="tahun"
                  value={form.tahun}
                  onChange={handleChange}
                  required
                  className="gov-input"
                />
              </Field>
            </motion.div>

            {/* RIGHT COLUMN */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-700">
                Informasi Anggaran
              </h3>

              <Field label="Satuan">
                <input
                  name="satuan"
                  value={form.satuan}
                  onChange={handleChange}
                  className="gov-input"
                />
              </Field>

              <Field label="Tarif per Satuan (Rp) *">
                <input
                  type="number"
                  name="tarif_per_satuan"
                  value={form.tarif_per_satuan}
                  onChange={handleChange}
                  required
                  className="gov-input"
                />
              </Field>

              <Field label="Mata Anggaran *">
                <select
                  name="mata_anggaran_id"
                  value={form.mata_anggaran_id}
                  onChange={handleChange}
                  required
                  className="gov-input"
                >
                  <option value={0}>-- Pilih Mata Anggaran --</option>
                  {mataAnggaranList.map((ma) => (
                    <option key={ma.id} value={ma.id}>
                      {ma.kode_anggaran} — {ma.nama_anggaran} ({ma.tahun})
                    </option>
                  ))}
                </select>
              </Field>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                Pastikan mata anggaran dan tarif sesuai dengan dokumen DIPA.
              </div>
            </motion.div>
          </div>

          {/* BUTTONS — EXACT MATCH */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate("/admin/kegiatan")}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Batal
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {loading ? "Menyimpan..." : "Simpan Kegiatan"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ================= FIELD WRAPPER ================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
