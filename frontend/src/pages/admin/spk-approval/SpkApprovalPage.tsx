import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import api from "@/lib/axios";

/* ==============================
 * TYPES
 * ============================== */
type SpkStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Spk {
  id: number;
  tahun: number;
  bulan: number;
  nomor_spk: string;
  status: SpkStatus;
  mitra: {
    nama_mitra: string;
  };
  total_honorarium: number;
  tanggal_pembayaran?: string | null;
  created_by_user_name?: string;
}

/* ==============================
 * PAGE
 * ============================== */
export default function SpkApprovalPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<Spk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpk = async () => {
      try {
        const res = await api.get("/admin/spk");
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message ?? "Gagal mengambil data SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSpk();
  }, []);

  if (loading) {
    return <p className="page-container">Memuat data SPK...</p>;
  }

  if (error) {
    return <p className="page-container error">{error}</p>;
  }

  if (data.length === 0) {
    return <p className="page-container">Belum ada SPK.</p>;
  }

  return (
    <div className="page-container">
      <h1>Persetujuan SPK</h1>

      <div className="spk-list">
        <AnimatePresence>
          {data.map((spk, index) => {
            const statusLabel =
              spk.status === "APPROVED"
                ? "DISETUJUI"
                : spk.status === "REJECTED"
                  ? "DITOLAK"
                  : "PENDING";

            const badgeClass =
              spk.status === "APPROVED"
                ? "badge-approved"
                : spk.status === "REJECTED"
                  ? "badge-used"
                  : "badge-draft";

            return (
              <motion.div
                key={spk.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 24px rgba(15, 76, 129, 0.18)",
                }}
                whileTap={{
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                  delay: index * 0.05,
                }}
                className="spk-bubble spk-bubble--clickable"
                onClick={() => navigate(`/admin/dashboard/spk/${spk.id}`)}
              >
                <div className="spk-bubble__top">
                  <div>
                    <div className="spk-bubble__title">{spk.nomor_spk}</div>
                    <div className="spk-bubble__meta">
                      {spk.mitra.nama_mitra} • {spk.bulan}/{spk.tahun}
                      {spk.created_by_user_name && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#1e40af",
                            fontWeight: 500,
                          }}
                        >
                          • Dibuat oleh {spk.created_by_user_name}
                        </span>
                      )}
                      {spk.tanggal_pembayaran ? (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#065f46",
                            fontWeight: 500,
                          }}
                        >
                          • Bayar: {spk.tanggal_pembayaran}
                        </span>
                      ) : (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#b45309",
                            fontWeight: 500,
                          }}
                        >
                          • ⚠ tanggal pembayaran belum diisi
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                </div>

                <div className="spk-bubble__amount">
                  Rp {Number(spk.total_honorarium).toLocaleString("id-ID")}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
