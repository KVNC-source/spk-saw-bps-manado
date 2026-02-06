import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { Spk } from "../spk-approval/spk.types";
import { SpkStatus } from "../spk-approval/spk.types";

export default function SpkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spk, setSpk] = useState<Spk | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/admin/spk/${id}`)
      .then((res) => setSpk(res.data))
      .catch(() => alert("Gagal memuat detail SPK"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= ACTIONS ================= */
  const approve = async () => {
    if (!spk || spk.status !== SpkStatus.PENDING) return;
    if (!confirm("Apakah Anda yakin ingin MENYETUJUI SPK ini?")) return;

    try {
      setProcessing(true);
      await api.patch(`/admin/spk/${id}/approve`);
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
      await api.patch(`/admin/spk/${id}/reject`, {
        admin_note: note,
      });
      navigate("/admin/dashboard/spk/approval");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="page-container">Memuat data…</div>;
  if (!spk) return <div className="page-container">SPK tidak ditemukan</div>;

  /* ================= RENDER ================= */
  return (
    <div className="page-container">
      <div className="form-card" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* ===== HEADER ===== */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
            }}
          >
            SURAT PERINTAH KERJA (SPK)
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginTop: 10,
              color: "var(--gov-blue)",
            }}
          >
            {spk.spk_kegiatan.toUpperCase()}
          </div>

          <div style={{ marginTop: 8, fontWeight: 600 }}>
            PERIODE {spk.bulan}/{spk.tahun}
          </div>

          <div style={{ marginTop: 12 }}>
            NOMOR: <strong>{spk.nomor_spk}</strong>
          </div>

          <div style={{ marginTop: 16 }}>
            <span
              className={`badge ${
                spk.status === SpkStatus.APPROVED
                  ? "badge-approved"
                  : spk.status === SpkStatus.REJECTED
                    ? "badge-used"
                    : "badge-draft"
              }`}
            >
              {spk.status}
            </span>
          </div>
        </div>

        {/* ===== META ===== */}
        <table className="gov-table" style={{ marginBottom: 32 }}>
          <tbody>
            <tr>
              <th>Mitra</th>
              <td>{spk.mitra.nama_mitra}</td>
            </tr>
            <tr>
              <th>Periode Pelaksanaan</th>
              <td>
                {spk.bulan}/{spk.tahun}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== HONOR ===== */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="text-muted">TOTAL HONORARIUM</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginTop: 6,
              color: "var(--gov-blue)",
            }}
          >
            Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            onClick={() =>
              window.open(`http://localhost:3000/spk/${spk.id}/pdf`, "_blank")
            }
          >
            Download SPK (PDF)
          </button>
        </div>

        {/* ===== DECISION ===== */}
        {spk.status === SpkStatus.PENDING && (
          <>
            <h3 className="form-section-title">Keputusan Administratif</h3>

            <label className="text-muted">Catatan Penolakan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Isi catatan jika SPK ditolak"
              className="form-card"
              style={{ marginBottom: 16 }}
            />

            <button
              onClick={approve}
              disabled={processing}
              style={{ width: "100%" }}
            >
              Setujui SPK
            </button>

            <button
              onClick={reject}
              disabled={processing}
              style={{
                width: "100%",
                marginTop: 12,
                background: "#92400e",
              }}
            >
              Tolak SPK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
