import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../../lib/axios";

interface MataAnggaranFormData {
  kode_anggaran: string;
  nama_anggaran: string;
  tahun: number;
  is_active: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

export default function MataAnggaranForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<MataAnggaranFormData>({
    kode_anggaran: "",
    nama_anggaran: "",
    tahun: new Date().getFullYear(),
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  /* ================= FETCH (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/admin/mata-anggaran/${id}`)
      .then((res) => {
        setForm({
          kode_anggaran: res.data.kode_anggaran,
          nama_anggaran: res.data.nama_anggaran,
          tahun: res.data.tahun,
          is_active: res.data.is_active,
        });
      })
      .catch(() => {
        alert("Gagal memuat data mata anggaran");
        navigate("/admin/dashboard/mata-anggaran");
      });
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

      navigate("/admin/dashboard/mata-anggaran");
    } catch (err: unknown) {
      let message = "Gagal menyimpan mata anggaran";

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
        {isEdit ? "Edit Mata Anggaran" : "Tambah Mata Anggaran"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* KODE ANGGARAN */}
        <div>
          <label className="form-label">Kode Anggaran</label>
          <input
            name="kode_anggaran"
            placeholder="Contoh: 521211"
            value={form.kode_anggaran}
            onChange={handleChange}
            required
            className="gov-input"
          />
          <small className="text-muted">
            Kode resmi sesuai dokumen anggaran
          </small>
        </div>

        {/* NAMA ANGGARAN */}
        <div>
          <label className="form-label">Nama Anggaran</label>
          <input
            name="nama_anggaran"
            placeholder="Contoh: Belanja Jasa Tenaga Ahli"
            value={form.nama_anggaran}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* TAHUN */}
        <div>
          <label className="form-label">Tahun Anggaran</label>
          <input
            type="number"
            name="tahun"
            value={form.tahun}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <label className="form-label mb-0">Aktif</label>
        </div>

        {/* ACTIONS */}
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
            onClick={() => navigate("/admin/dashboard/mata-anggaran")}
            className="gov-btn gov-btn-secondary"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
