import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import api from "../../lib/axios";

/* ================= TYPES ================= */

interface MataAnggaranFormData {
  kode_anggaran: string;
  nama_anggaran: string;
  tahun: number;
  is_active: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

/* ================= COMPONENT ================= */

export default function MataAnggaranForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const [form, setForm] = useState<MataAnggaranFormData>({
    kode_anggaran: "",
    nama_anggaran: "",
    tahun: currentYear,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  /* ================= FETCH EDIT ================= */
  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/admin/mata-anggaran/${id}`)
      .then((res) => {
        setForm(res.data);
      })
      .catch(() => navigate("/admin/mata-anggaran"));
  }, [id, isEdit, navigate]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "tahun"
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
        await api.patch(`/admin/mata-anggaran/${id}`, form);
      } else {
        await api.post("/admin/mata-anggaran", form);
      }

      setNotification("Data mata anggaran berhasil disimpan ✔");

      setTimeout(() => {
        navigate("/admin/mata-anggaran");
      }, 1200);
    } catch (err: unknown) {
      let message = "Gagal menyimpan mata anggaran";

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
      className="dashboard-container max-w-4xl mx-auto"
    >
      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="dashboard-title">
          {isEdit ? "Edit Mata Anggaran" : "Tambah Mata Anggaran"}
        </h1>
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        {/* BLUE HEADER */}
        <div className="bg-blue-700 text-white px-6 py-4">
          <h2 className="font-semibold text-sm">Form Mata Anggaran</h2>
          <p className="text-xs text-blue-100 mt-1">
            Lengkapi informasi mata anggaran di bawah ini
          </p>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* NOTIFICATION */}
          {notification && (
            <div className="px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
              {notification}
            </div>
          )}

          {/* KODE */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Kode Anggaran *
            </label>
            <input
              name="kode_anggaran"
              value={form.kode_anggaran}
              onChange={handleChange}
              placeholder="Contoh: MAT-2024-001"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Format: MAT-TAHUN-NOMOR
            </p>
          </div>

          {/* NAMA */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Nama Anggaran *
            </label>
            <input
              name="nama_anggaran"
              value={form.nama_anggaran}
              onChange={handleChange}
              placeholder="Masukkan nama mata anggaran"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TAHUN */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tahun *</label>
            <select
              name="tahun"
              value={form.tahun}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS TOGGLE */}
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Status Aktif</p>
              <p className="text-xs text-gray-500">
                Aktifkan mata anggaran untuk digunakan dalam sistem
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/mata-anggaran")}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* INFO BOX */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
        <p className="font-medium mb-1">Informasi Penting</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Kode anggaran harus unik dan tidak boleh sama.</li>
          <li>Pastikan tahun sesuai dengan periode perencanaan.</li>
          <li>
            Mata anggaran yang tidak aktif tidak akan muncul di pilihan input
            lainnya.
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
