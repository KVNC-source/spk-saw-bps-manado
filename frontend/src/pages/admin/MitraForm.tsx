import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../../lib/axios";

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

  /* =============================
   * FETCH DATA (EDIT MODE)
   * ============================= */
  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/admin/mitra/${id}`)
      .then((res) => {
        setForm({
          nama_mitra: res.data.nama_mitra ?? "",
          alamat: res.data.alamat ?? "",
          nik: res.data.nik ?? "",
          email: res.data.email ?? "",
          no_hp: res.data.no_hp ?? "",
          bank: res.data.bank ?? "",
          no_rekening: res.data.no_rekening ?? "",
        });
      })
      .catch(() => {
        alert("Gagal memuat data mitra");
        navigate("/admin/dashboard/mitra");
      });
  }, [id, isEdit, navigate]);

  /* =============================
   * HANDLE CHANGE
   * ============================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =============================
   * SUBMIT
   * ============================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.patch(`/admin/mitra/${id}`, form);
      } else {
        await api.post("/admin/mitra", form);
      }

      navigate("/admin/dashboard/mitra");
    } catch (err: unknown) {
      let message = "Gagal menyimpan data mitra";

      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.message) message = data.message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container max-w-2xl">
      <h1 className="dashboard-title mb-4">
        {isEdit ? "Edit Mitra" : "Tambah Mitra"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAMA */}
        <input
          name="nama_mitra"
          placeholder="Nama Mitra"
          value={form.nama_mitra}
          onChange={handleChange}
          required
          className="gov-input"
        />

        {/* ALAMAT */}
        <textarea
          name="alamat"
          placeholder="Alamat Mitra"
          value={form.alamat}
          onChange={handleChange}
          rows={3}
          className="gov-input"
        />

        {/* NIK */}
        <input
          name="nik"
          placeholder="NIK"
          value={form.nik}
          onChange={handleChange}
          className="gov-input"
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="gov-input"
        />

        {/* NO HP */}
        <input
          name="no_hp"
          placeholder="No. HP"
          value={form.no_hp}
          onChange={handleChange}
          className="gov-input"
        />

        {/* BANK */}
        <input
          name="bank"
          placeholder="Bank"
          value={form.bank}
          onChange={handleChange}
          className="gov-input"
        />

        {/* NO REKENING */}
        <input
          name="no_rekening"
          placeholder="No. Rekening"
          value={form.no_rekening}
          onChange={handleChange}
          className="gov-input"
        />

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="gov-btn gov-btn-primary"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/mitra")}
            className="gov-btn gov-btn-secondary"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
