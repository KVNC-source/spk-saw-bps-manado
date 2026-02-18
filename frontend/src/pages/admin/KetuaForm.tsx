import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import api from "@/lib/axios";

/* ================= TYPES ================= */

interface ApiErrorResponse {
  message?: string;
}

interface Mitra {
  id: number;
  nama_mitra: string;
}

interface KetuaFormData {
  username: string;
  name: string;
  email?: string;
  password?: string;
  mitra_id?: number;
}

/* ================= COMPONENT ================= */

export default function KetuaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<KetuaFormData>({
    username: "",
    name: "",
    email: "",
    password: "",
    mitra_id: undefined,
  });

  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  /* ================= FETCH MITRA ================= */
  useEffect(() => {
    api
      .get<Mitra[]>("/spk/mitra")
      .then((res) => setMitraList(res.data))
      .catch(() => {});
  }, []);

  /* ================= FETCH EDIT DATA ================= */
  useEffect(() => {
    if (!isEdit || !id) return;

    api
      .get<KetuaFormData>(`/spk/ketua/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          username: data.username,
          name: data.name,
          email: data.email ?? "",
          mitra_id: data.mitra_id ?? undefined,
        });
      })
      .catch(() => navigate("/admin/ketua"));
  }, [id, isEdit, navigate]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "mitra_id" ? Number(value) || undefined : value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/spk/ketua/${id}`, {
          username: form.username,
          name: form.name,
          email: form.email,
          mitra_id: form.mitra_id,
        });
      } else {
        await api.post("/spk/ketua", {
          username: form.username,
          name: form.name,
          email: form.email,
          password: form.password,
          mitra_id: form.mitra_id,
        });
      }

      setNotification("Data ketua tim berhasil disimpan ✔");

      setTimeout(() => {
        navigate("/admin/ketua");
      }, 1200);
    } catch (err: unknown) {
      let message = "Terjadi kesalahan";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        message = data?.message ?? message;
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
      className="dashboard-container max-w-3xl mx-auto"
    >
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="dashboard-title">
          {isEdit ? "Edit Ketua Tim" : "Tambah Ketua Tim"}
        </h1>
        <p className="dashboard-subtitle">
          {isEdit
            ? "Perbarui data ketua tim"
            : "Tambahkan ketua tim baru ke sistem"}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <InputField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          {/* Name */}
          <InputField
            label="Nama Lengkap"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          {/* Password (Only Create) */}
          {!isEdit && (
            <InputField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}

          {/* Mitra */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mitra</label>
            <select
              name="mitra_id"
              value={form.mitra_id ?? ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Mitra (Opsional) --</option>
              {mitraList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama_mitra}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate("/admin/ketua")}
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
              {loading
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan Ketua"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ================= REUSABLE FIELD ================= */

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputField({ label, ...props }: InputFieldProps) {
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
