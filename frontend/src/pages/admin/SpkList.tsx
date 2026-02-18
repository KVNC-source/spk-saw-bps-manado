import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllSpk, getSpkPdfUrl } from "../../services/spk.service";
import type { SpkItem } from "../../services/spk.service";

export default function SpkList() {
  const [data, setData] = useState<SpkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    getAllSpk()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const total = data.length;
  const pending = data.filter((d) => d.status === "PENDING").length;
  const approved = data.filter((d) => d.status === "APPROVED").length;
  const rejected = data.filter((d) => d.status === "REJECTED").length;

  return (
    <div className="dashboard-container space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="dashboard-title">Persetujuan SPK</h1>
        <p className="dashboard-subtitle">
          Kelola persetujuan Surat Perjanjian Kerja Mitra
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total SPK" value={total} color="blue" />
        <StatCard title="Pending" value={pending} color="yellow" />
        <StatCard title="Approved" value={approved} color="green" />
        <StatCard title="Rejected" value={rejected} color="red" />
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>Memuat data SPK...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              Tidak ada data SPK
            </div>
          ) : (
            data.map((spk, index) => (
              <motion.div
                key={spk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-5 space-y-4 border"
              >
                {/* STATUS + NOMOR */}
                <div className="flex justify-between items-center">
                  <StatusBadge status={spk.status} />
                  <span className="text-xs text-gray-500">{spk.nomorSpk}</span>
                </div>

                {/* INFO */}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {spk.mitraNama}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Periode: {spk.periode}
                  </p>
                </div>

                {/* NILAI */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Total Honorarium:</p>
                  <p className="text-blue-700 font-semibold text-lg">
                    Rp {Number(spk.totalNilai).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* ACTION */}
                {spk.status === "PENDING" ? (
                  <div className="flex gap-3">
                    <button className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 transition">
                      ✓ Approve
                    </button>
                    <button className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600 transition">
                      ✕ Reject
                    </button>
                  </div>
                ) : (
                  <div
                    className={`text-sm font-medium ${
                      spk.status === "APPROVED"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {spk.status === "APPROVED"
                      ? "✔ Telah Disetujui"
                      : "✕ Ditolak"}
                  </div>
                )}

                {/* PREVIEW */}
                <button
                  onClick={() => setSelectedPdf(getSpkPdfUrl(spk.id))}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Preview PDF
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* PDF MODAL */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[85%] h-[90%] p-4 rounded-xl shadow-xl">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Preview SPK</h2>
              <button
                className="text-red-600"
                onClick={() => setSelectedPdf(null)}
              >
                Tutup
              </button>
            </div>

            <iframe
              src={selectedPdf}
              className="w-full h-full border rounded"
              title="SPK PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "yellow" | "green" | "red";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${colors[color]}`}
      >
        ●
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  const base = "px-3 py-1 text-xs rounded-full font-medium";

  if (status === "APPROVED")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>Approved</span>
    );

  if (status === "REJECTED")
    return <span className={`${base} bg-red-100 text-red-600`}>Rejected</span>;

  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
  );
}
