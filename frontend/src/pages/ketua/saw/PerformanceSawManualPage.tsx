import { useState } from "react";
import api from "@/lib/axios";

/* =====================================================
   TYPES
===================================================== */

interface SpkItem {
  id: number;
  mitra: {
    id: number;
    nama_mitra: string;
  };
}

interface InputState {
  spkDocumentId: number;
  ketepatan_waktu: number;
  kualitas: number;
  komunikasi: number;
}

interface PerformanceResultItem {
  mitraId: number;
  mitraNama: string;
  ketepatan_waktu: number;
  kualitas: number;
  komunikasi: number;
  nilaiPreferensi: number;
  peringkat: number;
  kategori: string;
}

interface NormalizedMatrixItem {
  mitraNama: string;
  n_ketepatan_waktu: number;
  n_kualitas: number;
  n_komunikasi: number;
}

export default function PerformanceSawManualPage() {
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState(1);

  const [spkList, setSpkList] = useState<SpkItem[]>([]);
  const [inputs, setInputs] = useState<InputState[]>([]);
  const [result, setResult] = useState<PerformanceResultItem[]>([]);
  const [normalized, setNormalized] = useState<NormalizedMatrixItem[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     FETCH APPROVED SPK
  ===================================================== */

  const fetchSpk = async () => {
    try {
      const res = await api.get<SpkItem[]>("/spk/approved", {
        params: { tahun, bulan },
      });

      setSpkList(res.data);

      setInputs(
        res.data.map((spk) => ({
          spkDocumentId: spk.id,
          ketepatan_waktu: 0,
          kualitas: 0,
          komunikasi: 0,
        })),
      );
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil SPK approved");
    }
  };

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (
    index: number,
    field: keyof InputState,
    value: string,
  ) => {
    const updated = [...inputs];
    updated[index] = {
      ...updated[index],
      [field]: Number(value),
    };
    setInputs(updated);
  };

  /* =====================================================
     SAVE & CALCULATE SAW
  ===================================================== */

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 1️⃣ Validate inputs
      for (const item of inputs) {
        if (
          item.ketepatan_waktu <= 0 ||
          item.kualitas <= 0 ||
          item.komunikasi <= 0
        ) {
          alert("Semua nilai harus diisi (minimal 1)");
          setLoading(false);
          return;
        }
      }

      // 2️⃣ Save all penilaian in parallel (FASTER)
      await Promise.all(
        inputs.map((item) =>
          api.post("/spk/saw/penilaian", {
            spkDocumentId: item.spkDocumentId,
            ketepatan_waktu: item.ketepatan_waktu,
            kualitas: item.kualitas,
            komunikasi: item.komunikasi,
          }),
        ),
      );

      // 3️⃣ Fetch result
      const res = await api.get<{
        normalizedMatrix: NormalizedMatrixItem[];
        hasil: PerformanceResultItem[];
      }>("/spk/saw/performance", {
        params: { tahun, bulan },
      });

      setResult(res.data.hasil);
      setNormalized(res.data.normalizedMatrix);

      alert("SAW Performance berhasil dihitung!");
    } catch (err) {
      console.error(err);
      alert("Gagal memproses SAW");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DASHBOARD SUMMARY
  ===================================================== */

  const averageScore =
    result.length > 0
      ? (
          result.reduce((sum, r) => sum + r.nilaiPreferensi, 0) / result.length
        ).toFixed(4)
      : "0.0000";

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Manual Performance Evaluation (SAW)
      </h1>

      {/* FILTER */}
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="border p-2 rounded w-32"
        />

        <input
          type="number"
          min={1}
          max={12}
          value={bulan}
          onChange={(e) => setBulan(Number(e.target.value))}
          className="border p-2 rounded w-24"
        />

        <button
          onClick={fetchSpk}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Load SPK
        </button>
      </div>

      {/* INPUT TABLE */}
      {spkList.length > 0 && (
        <>
          <table className="w-full border mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Mitra</th>
                <th className="border p-2">Ketepatan Waktu</th>
                <th className="border p-2">Kualitas</th>
                <th className="border p-2">Komunikasi</th>
              </tr>
            </thead>
            <tbody>
              {spkList.map((spk, index) => (
                <tr key={spk.id}>
                  <td className="border p-2">{spk.mitra.nama_mitra}</td>

                  <td className="border p-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="border p-1 w-full"
                      onChange={(e) =>
                        handleChange(index, "ketepatan_waktu", e.target.value)
                      }
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="border p-1 w-full"
                      onChange={(e) =>
                        handleChange(index, "kualitas", e.target.value)
                      }
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="border p-1 w-full"
                      onChange={(e) =>
                        handleChange(index, "komunikasi", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Simpan & Hitung SAW"}
          </button>
        </>
      )}

      {/* DASHBOARD SUMMARY */}
      {result.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-sm text-gray-600">Total Mitra</p>
            <p className="text-xl font-bold">{result.length}</p>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <p className="text-sm text-gray-600">Top Performer</p>
            <p className="text-xl font-bold">{result[0].mitraNama}</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-xl font-bold">{averageScore}</p>
          </div>
        </div>
      )}

      {/* NORMALIZED MATRIX */}
      {normalized.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Normalized Matrix (R)</h2>

          <table className="w-full border mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Mitra</th>
                <th className="border p-2">N-Waktu</th>
                <th className="border p-2">N-Kualitas</th>
                <th className="border p-2">N-Komunikasi</th>
              </tr>
            </thead>
            <tbody>
              {normalized.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.mitraNama}</td>
                  <td className="border p-2 text-center">
                    {item.n_ketepatan_waktu}
                  </td>
                  <td className="border p-2 text-center">{item.n_kualitas}</td>
                  <td className="border p-2 text-center">
                    {item.n_komunikasi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RANKING RESULT */}
      {result.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Ranking Result</h2>

          {result.map((item) => (
            <div
              key={item.mitraId}
              className={`border p-3 mb-2 rounded ${
                item.peringkat === 1 ? "bg-yellow-100 font-semibold" : ""
              }`}
            >
              Rank {item.peringkat} - {item.mitraNama} - Score:{" "}
              {item.nilaiPreferensi.toFixed(4)} -{" "}
              <span className="italic">{item.kategori}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
