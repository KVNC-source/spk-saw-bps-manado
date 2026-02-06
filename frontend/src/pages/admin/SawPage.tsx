import { useState } from "react";
import { calculateSaw } from "../../services/saw.service";
import type { SawResultDto } from "../../types/saw-result.dto";
import { getSpkPdfUrl } from "../../services/spk.service";

export default function SawPage() {
  const [tahun, setTahun] = useState(2025);
  const [bulan, setBulan] = useState(1);

  // Required by backend DTO
  const [spkRoleId] = useState(1); // ADMIN role (adjust if needed)
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
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-1">Perhitungan SAW</h1>
      <p className="text-sm text-gray-600 mb-4">
        Penetapan hasil seleksi mitra berbasis metode SAW
      </p>

      {/* Parameter Form */}
      <div className="border p-4 mb-6 rounded space-y-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm">Tahun</label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="border p-2"
            />
          </div>

          <div>
            <label className="block text-sm">Bulan</label>
            <input
              type="number"
              min={1}
              max={12}
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="border p-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm">Tanggal Mulai</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="border p-2"
            />
          </div>

          <div>
            <label className="block text-sm">Tanggal Selesai</label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="border p-2"
            />
          </div>
        </div>

        {/* Minimal kegiatan selector */}
        <div>
          <label className="block text-sm mb-1">Kegiatan</label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={kegiatanIds.includes(1)}
              onChange={(e) => setKegiatanIds(e.target.checked ? [1] : [])}
            />
            Kegiatan Contoh (ID: 1)
          </label>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || kegiatanIds.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Memproses..." : "Hitung SAW"}
        </button>
      </div>

      {/* Result Table = SPK List */}
      {result && (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Peringkat</th>
              <th className="p-2 border">Mitra</th>
              <th className="p-2 border">Nilai Akhir</th>
              <th className="p-2 border">SPK</th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((item) => (
              <tr key={item.id}>
                <td className="p-2 border">{item.peringkat}</td>
                <td className="p-2 border">{item.mitraNama}</td>
                <td className="p-2 border">{item.nilaiAkhir}</td>
                <td className="p-2 border">
                  <a
                    href={getSpkPdfUrl(item.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Preview SPK
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
