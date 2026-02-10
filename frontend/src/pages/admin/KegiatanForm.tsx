import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import api from "../../lib/axios";

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

  /* ================= FETCH MATA ANGGARAN ================= */
  useEffect(() => {
    api
      .get<MataAnggaran[]>("/admin/mata-anggaran")
      .then((res) => setMataAnggaranList(res.data))
      .catch(() => alert("Gagal memuat data mata anggaran"));
  }, []);

  /* ================= FETCH (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit) return;

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
      .catch(() => {
        alert("Gagal memuat data kegiatan");
        navigate("/admin/dashboard/kegiatan");
      });
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

      navigate("/admin/dashboard/kegiatan");
    } catch (err: unknown) {
      let message = "Gagal menyimpan kegiatan";

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
        {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* KODE KEGIATAN */}
        <div>
          <label className="form-label">Kode Kegiatan</label>
          <input
            name="kode_kegiatan"
            placeholder="Contoh: KGT-2026-01"
            value={form.kode_kegiatan}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* NAMA */}
        <div>
          <label className="form-label">Nama Kegiatan</label>
          <input
            name="nama_kegiatan"
            value={form.nama_kegiatan}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* JENIS */}
        <div>
          <label className="form-label">Jenis Kegiatan</label>
          <input
            name="jenis_kegiatan"
            value={form.jenis_kegiatan}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* TAHUN */}
        <div>
          <label className="form-label">Tahun</label>
          <input
            type="number"
            name="tahun"
            value={form.tahun}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* SATUAN */}
        <div>
          <label className="form-label">Satuan (opsional)</label>
          <input
            name="satuan"
            value={form.satuan}
            onChange={handleChange}
            className="gov-input"
          />
        </div>

        {/* TARIF */}
        <div>
          <label className="form-label">Tarif per Satuan (Rp)</label>
          <input
            type="number"
            name="tarif_per_satuan"
            value={form.tarif_per_satuan}
            onChange={handleChange}
            required
            className="gov-input"
          />
        </div>

        {/* ✅ MATA ANGGARAN DROPDOWN */}
        <div>
          <label className="form-label">Mata Anggaran</label>

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

          <small className="text-muted">
            Pilih mata anggaran yang sesuai dengan kegiatan
          </small>
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
            onClick={() => navigate("/admin/dashboard/kegiatan")}
            className="gov-btn gov-btn-secondary"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
