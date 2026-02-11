import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import type { SpkDetail } from "../spk-approval/spk.types";

/* ================= CONSTANTS ================= */

interface KegiatanMaster {
  id: number;
  nama_kegiatan: string;
}

/* ================= PAGE ================= */

export default function SpkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [spk, setSpk] = useState<SpkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [note, setNote] = useState("");

  /* ===== ROLE (TEMP / MOCK) ===== */
  const userRole: "ADMIN" | "KETUA_TIM" = "ADMIN";
  const canEditItems = userRole === "ADMIN";

  /* ===== KEGIATAN CRUD ===== */
  const [kegiatanMaster, setKegiatanMaster] = useState<KegiatanMaster[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | "">("");
  const [volume, setVolume] = useState(1);

  /* ===== LOAD SPK ===== */

  const loadSpk = async () => {
    const res = await api.get(`/spk/${id}`);
    setSpk(res.data);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadSpk()
      .catch(() => alert("Gagal memuat detail SPK"))
      .finally(() => setLoading(false));
  }, [id]);

  /* ===== LOAD MASTER KEGIATAN ===== */

  useEffect(() => {
    api.get("/kegiatan").then((res) => setKegiatanMaster(res.data));
  }, []);

  /* ===== ACTIONS ===== */

  const approve = async () => {
    if (!spk || spk.status !== "PENDING") return;

    if (!confirm("Apakah Anda yakin ingin MENYETUJUI SPK ini?")) return;

    try {
      setProcessing(true);
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

  const addItem = async () => {
    if (!selectedKegiatanId || volume <= 0) {
      alert("Kegiatan dan volume wajib diisi");
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/spk/${spk!.id}/items`, {
        kegiatan_id: selectedKegiatanId,
        volume,
      });
      await loadSpk();
      setShowAddModal(false);
      setSelectedKegiatanId("");
      setVolume(1);
    } finally {
      setProcessing(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm("Hapus kegiatan ini?")) return;

    try {
      setProcessing(true);
      await api.delete(`/spk/items/${itemId}`);
      await loadSpk();
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
            Rp {spk.total_honorarium.toLocaleString("id-ID")}
          </div>
        </div>

        {/* ===== DOWNLOAD BUTTONS ===== */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            className="form-button"
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/spk/${spk.id}/pdf`,
                "_blank",
              )
            }
          >
            Download SPK (PDF)
          </button>
        </div>

        {spk.status === "APPROVED" && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <button
              className="form-button"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/bast/${spk.id}/pdf`,
                  "_blank",
                )
              }
            >
              Download BAST (PDF)
            </button>
          </div>
        )}

        {/* ===== KEGIATAN LIST ===== */}
        <h3 className="form-section-title">Daftar Kegiatan</h3>

        {canEditItems && (
          <button onClick={() => setShowAddModal(true)}>
            + Tambah Kegiatan
          </button>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kegiatan</th>
              <th>Volume</th>
              <th>Harga</th>
              <th>Nilai</th>
              {canEditItems && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {spk.kegiatan.map((k, i) => (
              <tr key={k.id}>
                <td>{i + 1}</td>
                <td>{k.nama_kegiatan}</td>
                <td>{k.volume}</td>
                <td>Rp {k.harga_satuan.toLocaleString("id-ID")}</td>
                <td>Rp {k.nilai.toLocaleString("id-ID")}</td>
                {canEditItems && (
                  <td>
                    <button
                      style={{ background: "#b91c1c" }}
                      onClick={() => deleteItem(k.id)}
                    >
                      Hapus
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== APPROVAL ===== */}
        {spk.status === "PENDING" && (
          <>
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

      {/* ===== ADD KEGIATAN MODAL ===== */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Tambah Kegiatan</h3>

            <select
              className="form-input"
              value={selectedKegiatanId}
              onChange={(e) => setSelectedKegiatanId(Number(e.target.value))}
            >
              <option value="">Pilih kegiatan</option>
              {kegiatanMaster.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kegiatan}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              className="form-input"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />

            <button onClick={addItem} disabled={processing}>
              Simpan
            </button>
            <button onClick={() => setShowAddModal(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
