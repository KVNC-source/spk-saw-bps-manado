import { useState } from "react";
import { calculateSaw } from "../../services/saw.service";
import type { SawResultDto } from "../../types/saw-result.dto";
import { getSpkPdfUrl } from "../../services/spk.service";

export default function SawPage() {
  const [tahun, setTahun] = useState(2025);
  const [bulan, setBulan] = useState(1);

  const [spkRoleId] = useState(1);
  const [kegiatanIds, setKegiatanIds] = useState<number[]>([1]);
  const [tanggalMulai, setTanggalMulai] = useState("2025-01-01");
  const [tanggalSelesai, setTanggalSelesai] = useState("2025-01-31");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SawResultDto | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const data = await calculateSaw({
        tahun,
        bulan,
        spkRoleId,
        kegiatanIds,
        tanggalMulai,
        tanggalSelesai,
      });

      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="dashboard-title">Perhitungan SAW</h1>
        <p className="dashboard-subtitle">
          Sistem Perhitungan Simple Additive Weighting untuk Evaluasi Mitra
        </p>
      </div>

      {/* ================= PARAMETER CARD ================= */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="font-semibold text-gray-800">Parameter Perhitungan</h2>

        {/* Tahun + Bulan + Range */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={1}>Januari</option>
              <option value={2}>Februari</option>
              <option value={3}>Maret</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Kriteria */}
        <div>
          <p className="font-medium mb-3">Kegiatan</p>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={kegiatanIds.includes(1)}
                onChange={(e) =>
                  setKegiatanIds(
                    e.target.checked
                      ? [...kegiatanIds, 1]
                      : kegiatanIds.filter((id) => id !== 1),
                  )
                }
              />
              Kegiatan Contoh (ID: 1)
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={kegiatanIds.includes(2)}
                onChange={(e) =>
                  setKegiatanIds(
                    e.target.checked
                      ? [...kegiatanIds, 2]
                      : kegiatanIds.filter((id) => id !== 2),
                  )
                }
              />
              Kegiatan Lain (ID: 2)
            </label>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-center">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600
                       text-white rounded-lg text-sm font-semibold
                       disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Hitung SAW"}
          </button>
        </div>
      </div>

      {/* ================= RESULT ================= */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-800">
                Hasil Perhitungan SAW
              </h2>
              <p className="text-sm text-gray-500">
                Ranking mitra berdasarkan nilai preferensi
              </p>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                Export Excel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm">
                Print
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Nama Mitra</th>
                  <th className="px-4 py-3 text-left">Nilai Preferensi</th>
                  <th className="px-4 py-3 text-left">SPK</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {result.results.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">
                      {item.peringkat}
                    </td>

                    <td className="px-4 py-3">{item.mitraNama}</td>

                    <td className="px-4 py-3 font-bold text-blue-600">
                      {item.nilaiAkhir}
                    </td>

                    <td className="px-4 py-3">
                      <a
                        href={getSpkPdfUrl(item.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Preview SPK
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
