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
    <div className="w-full px-10 py-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-text-main">
          Perhitungan SAW
        </h1>
        <p className="text-[14px] text-text-muted">
          Penetapan hasil seleksi mitra berbasis metode SAW
        </p>
      </div>

      {/* PARAMETER FORM */}
      <div
        className="mb-8 p-6 rounded-[16px]
        bg-white/70 backdrop-blur-glass
        border border-white/40 shadow-neo space-y-6"
      >
        {/* Tahun & Bulan */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-semibold text-text-muted">
              Tahun
            </label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="h-[42px] w-[160px] px-4 rounded-[10px]
                border border-black/10 bg-white
                focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-semibold text-text-muted">
              Bulan
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="h-[42px] w-[160px] px-4 rounded-[10px]
                border border-black/10 bg-white
                focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20"
            />
          </div>
        </div>

        {/* Tanggal */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-semibold text-text-muted">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="h-[42px] px-4 rounded-[10px]
                border border-black/10 bg-white
                focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-[13px] font-semibold text-text-muted">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="h-[42px] px-4 rounded-[10px]
                border border-black/10 bg-white
                focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20"
            />
          </div>
        </div>

        {/* Kegiatan */}
        <div>
          <label className="block mb-2 text-[13px] font-semibold text-text-muted">
            Kegiatan
          </label>
          <label className="inline-flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={kegiatanIds.includes(1)}
              onChange={(e) => setKegiatanIds(e.target.checked ? [1] : [])}
              className="accent-gov-blue"
            />
            Kegiatan Contoh (ID: 1)
          </label>
        </div>

        {/* ACTION */}
        <button
          onClick={handleCalculate}
          disabled={loading || kegiatanIds.length === 0}
          className="h-[44px] px-6 rounded-[12px]
            bg-gov-blue text-white font-semibold
            shadow-neo transition
            hover:bg-[#0d3f6b]
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Hitung SAW"}
        </button>
      </div>

      {/* RESULT TABLE */}
      {result && (
        <div
          className="p-4 rounded-[16px]
          bg-white/70 backdrop-blur-glass
          border border-white/40 shadow-neo"
        >
          <table className="w-full border-separate border-spacing-0 bg-white rounded-[12px] overflow-hidden">
            <thead className="bg-gov-blue">
              <tr>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white">
                  Peringkat
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white">
                  Mitra
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white">
                  Nilai Akhir
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white">
                  SPK
                </th>
              </tr>
            </thead>

            <tbody>
              {result.results.map((item) => (
                <tr key={item.id} className="hover:bg-black/5 transition">
                  <td className="px-4 py-3 border-b border-black/10">
                    {item.peringkat}
                  </td>
                  <td className="px-4 py-3 border-b border-black/10">
                    {item.mitraNama}
                  </td>
                  <td className="px-4 py-3 border-b border-black/10 font-semibold">
                    {item.nilaiAkhir}
                  </td>
                  <td className="px-4 py-3 border-b border-black/10">
                    <a
                      href={getSpkPdfUrl(item.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gov-blue font-semibold hover:underline"
                    >
                      Preview SPK
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
