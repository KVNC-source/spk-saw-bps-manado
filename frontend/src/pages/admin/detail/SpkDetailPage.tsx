import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { Spk } from "../spk-approval/spk.types";
import { SpkStatus } from "../spk-approval/spk.types";

/* ================= CONSTANTS ================= */

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const TANGGAL_OPTIONS = [
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
  "dua belas",
  "tiga belas",
  "empat belas",
  "lima belas",
  "enam belas",
  "tujuh belas",
  "delapan belas",
  "sembilan belas",
  "dua puluh",
  "dua puluh satu",
  "dua puluh dua",
  "dua puluh tiga",
  "dua puluh empat",
  "dua puluh lima",
  "dua puluh enam",
  "dua puluh tujuh",
  "dua puluh delapan",
  "dua puluh sembilan",
  "tiga puluh",
  "tiga puluh satu",
];

/* ================= PAGE ================= */

export default function SpkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spk, setSpk] = useState<Spk | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [note, setNote] = useState("");

  /* ===== LEGAL INPUTS ===== */

  const [hari, setHari] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("");

  const [tanggalBayar, setTanggalBayar] = useState("");
  const [bulanBayar, setBulanBayar] = useState("");
  const [tahunBayar, setTahunBayar] = useState("");

  /* ===== DERIVED TEXT ===== */

  const tanggalPerjanjianFinal =
    hari && tanggal && bulan && tahun
      ? `Pada hari ini ${hari}, tanggal ${tanggal}, bulan ${bulan}, tahun ${tahun}`
      : "";

  const tanggalPembayaranFinal =
    tanggalBayar && bulanBayar && tahunBayar
      ? `tanggal ${tanggalBayar}, bulan ${bulanBayar}, tahun ${tahunBayar}`
      : "";

  /* ===== LOAD SPK ===== */

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/spk/${id}`)
      .then((res) => setSpk(res.data))
      .catch(() => alert("Gagal memuat detail SPK"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ===== ACTIONS ===== */

  const approve = async () => {
    if (!spk || spk.status !== SpkStatus.PENDING) return;

    if (!tanggalPerjanjianFinal || !tanggalPembayaranFinal) {
      alert("Tanggal perjanjian dan pembayaran wajib diisi");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin MENYETUJUI SPK ini?")) return;

    try {
      setProcessing(true);

      await api.patch(`/spk/${id}`, {
        tanggal_perjanjian: tanggalPerjanjianFinal,
        tanggal_pembayaran: tanggalPembayaranFinal,
      });

      await api.patch(`/spk/${id}/approve`);
      navigate("/admin/dashboard/spk/approval");
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!note.trim()) {
      alert("Catatan penolakan wajib diisi");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin MENOLAK SPK ini?")) return;

    try {
      setProcessing(true);
      await api.patch(`/admin/spk/${id}/reject`, { admin_note: note });
      navigate("/admin/dashboard/spk/approval");
    } finally {
      setProcessing(false);
    }
  };

  /* ===== RENDER ===== */

  if (loading) return <div className="page-container">Memuat data…</div>;
  if (!spk) return <div className="page-container">SPK tidak ditemukan</div>;

  return (
    <div className="page-container">
      <div className="form-card" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ===== HEADER ===== */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em" }}
          >
            SURAT PERINTAH KERJA (SPK)
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>
            {spk.spk_kegiatan.toUpperCase()}
          </div>

          <div style={{ marginTop: 8, fontWeight: 600 }}>
            PERIODE {spk.bulan}/{spk.tahun}
          </div>

          <div style={{ marginTop: 12 }}>
            NOMOR: <strong>{spk.nomor_spk}</strong>
          </div>
        </div>

        {/* ===== HONOR ===== */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="text-muted">TOTAL HONORARIUM</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
          </div>
        </div>

        {/* ===== DOWNLOAD BUTTONS ===== */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            className="form-button"
            onClick={() =>
              window.open(`http://localhost:3000/spk/${spk.id}/pdf`, "_blank")
            }
          >
            Download SPK (PDF)
          </button>
        </div>

        {spk.status === SpkStatus.APPROVED && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <button
              className="form-button"
              onClick={() =>
                window.open(
                  `http://localhost:3000/bast/${spk.id}/pdf`,
                  "_blank",
                )
              }
            >
              Download BAST (PDF)
            </button>
          </div>
        )}

        {/* ===== LEGAL INPUTS ===== */}
        {spk.status === SpkStatus.PENDING && (
          <>
            <h3 className="form-section-title">Tanggal Perjanjian</h3>

            <Select
              value={hari}
              onChange={setHari}
              options={HARI}
              placeholder="Pilih hari"
            />
            <Select
              value={tanggal}
              onChange={setTanggal}
              options={TANGGAL_OPTIONS}
              placeholder="Pilih tanggal"
            />
            <Select
              value={bulan}
              onChange={setBulan}
              options={BULAN}
              placeholder="Pilih bulan"
            />

            <input
              type="number"
              className="form-input"
              placeholder="Tahun (contoh: 2026)"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            />

            {tanggalPerjanjianFinal && (
              <div className="form-preview">{tanggalPerjanjianFinal}</div>
            )}

            <h3 className="form-section-title">Tanggal Pembayaran</h3>

            <Select
              value={tanggalBayar}
              onChange={setTanggalBayar}
              options={TANGGAL_OPTIONS}
              placeholder="Pilih tanggal"
            />
            <Select
              value={bulanBayar}
              onChange={setBulanBayar}
              options={BULAN}
              placeholder="Pilih bulan"
            />

            <input
              type="number"
              className="form-input"
              placeholder="Tahun (contoh: 2026)"
              value={tahunBayar}
              onChange={(e) => setTahunBayar(e.target.value)}
            />

            {tanggalPembayaranFinal && (
              <div className="form-preview">{tanggalPembayaranFinal}</div>
            )}

            <h3 className="form-section-title">Keputusan Administratif</h3>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
              placeholder="Catatan penolakan"
            />

            <button onClick={approve} disabled={processing}>
              Setujui SPK
            </button>

            <button
              onClick={reject}
              disabled={processing}
              style={{ background: "#92400e", marginTop: 12 }}
            >
              Tolak SPK
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= REUSABLE SELECT ================= */

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
