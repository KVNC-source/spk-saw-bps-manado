import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type SpkStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface SpkRequestItem {
  id: number;
  created_at: string;
  spkDocument: {
    id: number;
    nomor_spk: string;
    total_honorarium?: number;
    status: SpkStatus; // ✅ Now using document status
    mitra: {
      nama_mitra: string;
    };
  } | null;
}

/* ================= COMPONENT ================= */

export default function KetuaSpkList() {
  const navigate = useNavigate();
  const [spk, setSpk] = useState<SpkRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SpkStatus | "ALL">("ALL");

  const fetchData = async () => {
    try {
      const res = await api.get<SpkRequestItem[]>("/ketua/spk");
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

  /* ================= FILTERING ================= */

  const filteredData = spk.filter((item) => {
    const nomorSpk = item.spkDocument?.nomor_spk ?? "";

    const matchSearch = nomorSpk.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "ALL" ? true : item.spkDocument?.status === filter;

    return matchSearch && matchFilter;
  });

  /* ================= SUMMARY ================= */

  const total = spk.length;

  const approved = spk.filter(
    (s) => s.spkDocument?.status === "APPROVED",
  ).length;

  const pending = spk.filter((s) => s.spkDocument?.status === "PENDING").length;

  const totalHonor = spk.reduce((sum, s) => {
    const value = Number(s.spkDocument?.total_honorarium ?? 0);
    return sum + value;
  }, 0);

  const statusStyle = (status: SpkStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Daftar SPK Saya</h1>
        <p className="text-sm text-gray-500">
          Kelola semua SPK yang berada di bawah supervisi Anda
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow-sm border">
          <p className="text-sm text-gray-500">Total SPK</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="bg-green-50 p-4 rounded shadow-sm border">
          <p className="text-sm text-gray-600">Disetujui</p>
          <p className="text-2xl font-bold">{approved}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded shadow-sm border">
          <p className="text-sm text-gray-600">Menunggu</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded shadow-sm border">
          <p className="text-sm text-gray-600">Total Honor</p>
          <p className="text-2xl font-bold">
            Rp{" "}
            {totalHonor.toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded shadow-sm border p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Daftar SPK</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Cari SPK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded text-sm"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as SpkStatus | "ALL")}
              className="border p-2 rounded text-sm"
            >
              <option value="ALL">Semua Status</option>
              <option value="APPROVED">Disetujui</option>
              <option value="PENDING">Menunggu</option>
              <option value="REJECTED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            <button
              onClick={() => navigate("/ketua/spk/create")}
              className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              + Buat SPK
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Nomor SPK</th>
              <th className="p-3">Nama Mitra</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Total Honor</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => {
              const doc = item.spkDocument;
              const status = doc?.status;

              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{doc?.nomor_spk ?? "-"}</td>

                  <td className="p-3">{doc?.mitra?.nama_mitra ?? "-"}</td>

                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </td>

                  <td className="p-3">
                    Rp {(doc?.total_honorarium ?? 0).toLocaleString("id-ID")}
                  </td>

                  <td className="p-3">
                    {status ? (
                      <span
                        className={`px-3 py-1 text-xs rounded ${statusStyle(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (!doc?.id) return;
                        navigate(`/ketua/spk/${doc.id}`);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            Tidak ada data SPK
          </div>
        )}
      </div>
    </div>
  );
}
