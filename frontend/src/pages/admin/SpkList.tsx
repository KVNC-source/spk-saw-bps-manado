import { useEffect, useState } from "react";
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-1">Daftar SPK</h1>
      <p className="text-sm text-gray-600 mb-4">
        Surat Perintah Kerja hasil penetapan SPK
      </p>

      {loading ? (
        <div>Memuat data SPK...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nomor SPK</th>
                <th className="p-2 border">Mitra</th>
                <th className="p-2 border">Periode</th>
                <th className="p-2 border">Nilai</th>
                <th className="p-2 border">Peringkat</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Tidak ada data SPK
                  </td>
                </tr>
              ) : (
                data.map((spk) => (
                  <tr key={spk.id}>
                    <td className="p-2 border">{spk.nomorSpk}</td>
                    <td className="p-2 border">{spk.mitraNama}</td>
                    <td className="p-2 border">{spk.periode}</td>
                    <td className="p-2 border">{spk.totalNilai}</td>
                    <td className="p-2 border">{spk.peringkat}</td>
                    <td className="p-2 border">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => setSelectedPdf(getSpkPdfUrl(spk.id))}
                      >
                        Preview PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Preview Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[85%] h-[90%] p-4 rounded">
            <div className="flex justify-between mb-2">
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
              className="w-full h-full border"
              title="SPK PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
}
