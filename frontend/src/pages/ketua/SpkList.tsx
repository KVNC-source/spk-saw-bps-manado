import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

/* =========================================================
   TYPES
========================================================= */

type SpkStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface SpkListItem {
  id: number;
  nomor_spk: string;
  status: SpkStatus;
  created_at: string;
  mitra: {
    nama_mitra: string;
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function KetuaSpkList() {
  const navigate = useNavigate();
  const [spk, setSpk] = useState<SpkListItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchData = async () => {
    try {
      const res = await api.get<SpkListItem[]>("/ketua/spk");
      setSpk(res.data);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || "Gagal memuat data SPK");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =====================================================
     CANCEL SPK
  ===================================================== */

  const handleCancel = async (id: number) => {
    if (!confirm("Batalkan SPK ini?")) return;

    try {
      await api.patch(`/ketua/spk/${id}/cancel`);
      await fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || "Gagal membatalkan SPK");
    }
  };

  /* =====================================================
     STATUS BADGE COLOR
  ===================================================== */

  const statusColor: Record<SpkStatus, string> = {
    PENDING: "bg-yellow-400",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    CANCELLED: "bg-gray-500",
  };

  /* =====================================================
     RENDER
  ===================================================== */

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar SPK Saya</h1>

        <button
          onClick={() => navigate("/ketua/spk/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Buat SPK
        </button>
      </div>

      {spk.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center text-gray-500">
          Belum ada SPK
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Nomor SPK</th>
                <th className="p-3">Mitra</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {spk.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.nomor_spk}</td>

                  <td className="p-3">{item.mitra.nama_mitra}</td>

                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-white text-sm rounded ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/ketua/spk/${item.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Detail
                    </button>

                    {item.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
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
