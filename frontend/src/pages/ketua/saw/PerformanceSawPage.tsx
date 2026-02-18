import { useState } from "react";
import { getPerformanceSaw } from "../../../lib/saw";
import type { PerformanceResultItem } from "../../../lib/saw";

export default function PerformanceSawPage() {
  const [tahun, setTahun] = useState<number>(2026);
  const [bulan, setBulan] = useState<number>(1);
  const [data, setData] = useState<PerformanceResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    try {
      setLoading(true);
      const result = await getPerformanceSaw(tahun, bulan);
      setData(result.hasil);
    } catch (error) {
      alert("Gagal mengambil data SAW");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const averageScore =
    data.length > 0
      ? (
          data.reduce((sum, item) => sum + item.nilaiPreferensi, 0) /
          data.length
        ).toFixed(4)
      : "0.0000";

  const topPerformer = data.length > 0 ? data[0] : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SAW Performance Evaluation</h1>

      {/* FILTER SECTION */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tahun</label>
          <input
            type="number"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="border p-2 rounded w-32"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Bulan</label>
          <input
            type="number"
            value={bulan}
            min={1}
            max={12}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="border p-2 rounded w-24"
          />
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Hitung SAW"}
        </button>
      </div>

      {/* EMPTY STATE */}
      {!loading && data.length === 0 && (
        <div className="border rounded p-6 text-center text-gray-500">
          Belum ada data SAW untuk periode ini.
        </div>
      )}

      {/* DASHBOARD CARDS */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-sm text-gray-600">Total Mitra</p>
            <p className="text-xl font-bold">{data.length}</p>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <p className="text-sm text-gray-600">Top Performer</p>
            <p className="text-xl font-bold">{topPerformer?.mitraNama}</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-xl font-bold">{averageScore}</p>
          </div>
        </div>
      )}

      {/* RESULT TABLE */}
      {data.length > 0 && (
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Rank</th>
              <th className="border p-2">Mitra</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.mitraId}
                className={
                  item.peringkat === 1 ? "bg-yellow-100 font-semibold" : ""
                }
              >
                <td className="border p-2 text-center">{item.peringkat}</td>
                <td className="border p-2">{item.mitraNama}</td>
                <td className="border p-2 text-center">
                  {item.nilaiPreferensi.toFixed(4)}
                </td>
                <td className="border p-2 text-center">{item.kategori}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DETAIL SUMMARY */}
      {data.length > 0 && (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.mitraId} className="border p-4 rounded bg-gray-50">
              <h3 className="font-semibold mb-1">{item.mitraNama}</h3>
              <p className="text-sm text-gray-700">
                Skor akhir: <strong>{item.nilaiPreferensi.toFixed(4)}</strong>{" "}
                dengan kategori <strong>{item.kategori}</strong>.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
