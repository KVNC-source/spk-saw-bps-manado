import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import api from "../../lib/axios";

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

/* ================= TYPES ================= */

interface MitraFormData {
  nama_mitra: string;
  alamat?: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  bank?: string;
  no_rekening?: string;
}

interface ApiErrorResponse {
  message?: string;
}

/* ================= MAIN COMPONENT ================= */

export default function MitraForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<MitraFormData>({
    nama_mitra: "",
    alamat: "",
    nik: "",
    email: "",
    no_hp: "",
    bank: "",
    no_rekening: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/admin/mitra/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => navigate("/admin/mitra"));
  }, [id, isEdit, navigate]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/admin/mitra/${id}`, form);
      } else {
        await api.post("/admin/mitra", form);
      }

      setNotification("Data mitra berhasil disimpan ✔");

      setTimeout(() => {
        navigate("/admin/mitra");
      }, 1200);
    } catch (err: unknown) {
      let message = "Gagal menyimpan data mitra";

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
          {isEdit ? "Edit Mitra" : "Tambah Mitra"}
        </h1>
        <p className="dashboard-subtitle">
          Lengkapi data mitra untuk mendaftarkan sebagai surveyor
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-700">Informasi Pribadi</h3>

              <Input
                label="Nama Lengkap *"
                name="nama_mitra"
                value={form.nama_mitra}
                onChange={handleChange}
                required
              />

              <Input
                label="NIK"
                name="nik"
                value={form.nik}
                onChange={handleChange}
              />

              <Input
                label="Nomor Telepon"
                name="no_hp"
                value={form.no_hp}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />

              <Textarea
                label="Alamat"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
              />
            </motion.div>

            {/* RIGHT COLUMN */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-700">
                Informasi Keuangan
              </h3>

              <SelectBank
                name="bank"
                value={form.bank}
                onChange={handleChange}
              />

              <Input
                label="Nomor Rekening"
                name="no_rekening"
                value={form.no_rekening}
                onChange={handleChange}
              />

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                Pastikan data rekening bank yang dimasukkan sudah benar.
              </div>
            </motion.div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate("/admin/mitra")}
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
              {loading ? "Menyimpan..." : "Simpan Mitra"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

function Textarea({ label, ...props }: TextareaProps) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectBank(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">Nama Bank</label>
      <select
        {...props}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Pilih Bank</option>
        <option value="BRI">BRI</option>
        <option value="BCA">BCA</option>
        <option value="BNI">BNI</option>
        <option value="Mandiri">Mandiri</option>
        <option value="BTN">BTN</option>
      </select>
    </div>
  );
}
