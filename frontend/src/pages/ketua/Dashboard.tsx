import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

interface Summary {
  totalSpk: number;
  approved: number;
  pending: number;
}

export default function KetuaDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await api.get("/ketua/spk/summary");
      setSummary(res.data);
    };

    fetchSummary();
  }, []);

  if (!summary) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Ketua</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total SPK</p>
          <p className="text-2xl font-semibold">{summary.totalSpk}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-semibold">{summary.pending}</p>
        </div>

        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-semibold">{summary.approved}</p>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/ketua/spk/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Buat SPK Baru
        </button>
      </div>
    </div>
  );
}
