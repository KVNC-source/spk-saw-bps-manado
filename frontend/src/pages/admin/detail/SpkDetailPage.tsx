import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import type { SpkDetail } from "../spk-approval/spk.types";

/* ================= TYPES ================= */

interface KegiatanMaster {
  id: number;
  nama_kegiatan: string;
}

interface RequestItem {
  id: number;
  volume: number;
  harga_satuan: number;
  nilai: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  kegiatan: {
    nama_kegiatan: string;
  };
}

/* ================= LEGAL OPTIONS ================= */

const hariOptions = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const bulanOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/* ================= TERBILANG ================= */

const terbilang = (n: number): string => {
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  if (n < 12) return satuan[n];
  if (n < 20) return `${satuan[n - 10]} belas`;
  if (n < 100) {
    const sisa = n % 10;
    return sisa === 0
      ? `${satuan[Math.floor(n / 10)]} puluh`
      : `${satuan[Math.floor(n / 10)]} puluh ${terbilang(sisa)}`;
  }
  if (n < 200) return `seratus ${terbilang(n - 100)}`;
  if (n < 1000)
    return `${satuan[Math.floor(n / 100)]} ratus ${terbilang(n % 100)}`;
  if (n < 2000) return `seribu ${terbilang(n - 1000)}`;
  if (n < 1_000_000)
    return `${terbilang(Math.floor(n / 1000))} ribu ${terbilang(n % 1000)}`;

  return n.toString();
};

/* ================= PAGE ================= */

export default function SpkDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [spk, setSpk] = useState<SpkDetail | null>(null);
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [kegiatanMaster, setKegiatanMaster] = useState<KegiatanMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editMulai, setEditMulai] = useState("");
  const [editSelesai, setEditSelesai] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | "">("");
  const [volume, setVolume] = useState(1);

  const [hari, setHari] = useState("Senin");
  const [tanggal, setTanggal] = useState(1);
  const [bulan, setBulan] = useState("Januari");
  const [tahun, setTahun] = useState(new Date().getFullYear());

  /* ================= PAYMENT DATE ================= */

  const [hariBayar, setHariBayar] = useState("Senin");
  const [tanggalBayar, setTanggalBayar] = useState(1);
  const [bulanBayar, setBulanBayar] = useState("Januari");
  const [tahunBayar, setTahunBayar] = useState(new Date().getFullYear());

  const formatTanggalTerbilang = (dateString?: string | null) => {
    if (!dateString) return "-";

    const d = new Date(dateString);

    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  /* ================= LOAD ================= */

  const loadSpk = async () => {
    if (!id) return;

    const [spkRes, requestRes] = await Promise.all([
      api.get(`/spk/${id}`),
      api.get(`/spk/${id}/request-items`),
    ]);

    setSpk(spkRes.data);
    setRequestItems(requestRes.data);
    setEditMulai(spkRes.data.tanggal_mulai?.slice(0, 10) || "");
    setEditSelesai(spkRes.data.tanggal_selesai?.slice(0, 10) || "");
  };

  useEffect(() => {
    if (!id) return;
    loadSpk().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get("/kegiatan").then((res) => setKegiatanMaster(res.data));
  }, []);

  const pendingRequests = requestItems.filter(
    (item) => item.status === "PENDING",
  );

  /* ================= DOWNLOAD ================= */

  const downloadSpk = async () => {
    if (!spk) return;

    const res = await api.get(`/spk/${spk.id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SPK-${spk.nomor_spk}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  const downloadBast = async () => {
    if (!spk) return;

    const res = await api.get(`/bast/${spk.id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BAST-${spk.nomor_spk}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  /* ================= LEGAL BUILD ================= */

  const buildTanggalPerjanjian = () =>
    `Pada hari ini ${hari}, tanggal ${terbilang(
      tanggal,
    )}, bulan ${bulan}, tahun ${terbilang(tahun)}`;

  const buildTanggalPembayaran = () =>
    `Pada hari ${hariBayar}, tanggal ${terbilang(
      tanggalBayar,
    )}, bulan ${bulanBayar}, tahun ${terbilang(tahunBayar)}`;

  const saveLegalDates = async () => {
    if (!spk) return;

    try {
      setProcessing(true);
      await api.patch(`/spk/${spk.id}`, {
        tanggal_perjanjian: buildTanggalPerjanjian(),
        tanggal_pembayaran: buildTanggalPembayaran(),
      });
      await loadSpk();
    } finally {
      setProcessing(false);
    }
  };

  /* ================= ADMIN ACTIONS ================= */

  const addItem = async () => {
    if (!spk || !selectedKegiatanId || volume <= 0) return;

    try {
      setProcessing(true);
      await api.post(`/spk/${spk.id}/items`, {
        kegiatan_id: selectedKegiatanId,
        volume,
      });
      await loadSpk();
      setShowAddModal(false);
      setSelectedKegiatanId("");
      setVolume(1);
    } finally {
      setProcessing(false);
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!confirm("Hapus kegiatan ini?")) return;

    try {
      setProcessing(true);
      await api.delete(`/spk/items/${itemId}`);
      await loadSpk();
    } finally {
      setProcessing(false);
    }
  };

  const approveItem = async (
    itemId: number,
    status: "APPROVED" | "REJECTED",
  ) => {
    try {
      setProcessing(true);
      await api.patch(`/spk/request-item/${itemId}`, { status });
      await loadSpk();
    } finally {
      setProcessing(false);
    }
  };

  const finalizeSpk = async () => {
    if (!spk) return;
    if (!confirm("Finalisasi SPK ini?")) return;

    try {
      setProcessing(true);
      await api.post(`/spk/${spk.id}/finalize`);
      await loadSpk();
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="dashboard-container">Memuat...</div>;
  if (!spk)
    return <div className="dashboard-container">SPK tidak ditemukan</div>;

  /* ===== UNIQUE MATA ANGGARAN ===== */

  const uniqueMataAnggaran = [
    ...new Map(
      spk.kegiatan
        .filter(
          (
            k,
          ): k is typeof k & {
            mata_anggaran: { kode: string; nama: string };
          } => k.mata_anggaran !== null && k.mata_anggaran !== undefined,
        )
        .map((k) => [k.mata_anggaran.kode, k.mata_anggaran]),
    ).values(),
  ];

  const statusColor =
    spk.status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : spk.status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : spk.status === "CANCELLED"
          ? "bg-gray-200 text-gray-600"
          : "bg-yellow-100 text-yellow-700";

  const savePeriodeKontrak = async () => {
    if (!spk) return;

    try {
      setProcessing(true);
      await api.patch(`/spk/${spk.id}/period`, {
        tanggal_mulai: editMulai,
        tanggal_selesai: editSelesai,
      });
      await loadSpk();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="dashboard-container space-y-8"
    >
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        {/* TOP ROW */}
        <div className="flex justify-between items-start">
          {/* LEFT SIDE */}
          <div>
            <h1 className="text-2xl font-semibold">SPK #{spk.nomor_spk}</h1>

            <p className="text-sm text-gray-500 mt-1">
              Tahun {spk.tahun} • Bulan {spk.bulan}
            </p>

            <p className="text-sm text-gray-500">
              Informasi lengkap kontrak kerja
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-end gap-3">
            {/* STATUS */}
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {spk.status}
            </span>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              {spk.status === "APPROVED" && (
                <>
                  <button
                    onClick={downloadSpk}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg text-sm"
                  >
                    Download SPK
                  </button>

                  <button
                    onClick={downloadBast}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg text-sm"
                  >
                    Download BAST
                  </button>
                </>
              )}

              {spk.status === "PENDING" && (
                <button
                  onClick={finalizeSpk}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Finalize SPK"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONTRACT META INFO */}
        <div className="grid grid-cols-3 gap-6 text-sm border-t pt-4">
          <div>
            <p className="text-gray-500">Nama Mitra</p>
            <p className="font-medium">{spk.mitra.nama_mitra}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Periode Kontrak</p>

            <div className="space-y-2">
              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editMulai}
                  onChange={(e) => setEditMulai(e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-[130px]"
                />

                <span className="text-gray-400">-</span>

                <input
                  type="date"
                  value={editSelesai}
                  onChange={(e) => setEditSelesai(e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-[130px]"
                />
              </div>

              {/* Terbilang */}
              <p className="text-xs text-gray-500">
                Terbilang: {formatTanggalTerbilang(editMulai)} s.d{" "}
                {formatTanggalTerbilang(editSelesai)}
              </p>

              {/* Save Button */}
              <button
                onClick={savePeriodeKontrak}
                disabled={processing}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md w-fit"
              >
                Simpan Periode
              </button>
            </div>
          </div>

          <div>
            <p className="text-gray-500">Mata Anggaran</p>
            <p className="font-medium">
              {uniqueMataAnggaran.length > 0
                ? uniqueMataAnggaran
                    .map((m) => `${m.kode} - ${m.nama}`)
                    .join(", ")
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* LEGAL INPUT */}
      {spk.status === "PENDING" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold">Input Tanggal Legal</h2>

          <div className="grid grid-cols-4 gap-3">
            <select
              value={hari}
              onChange={(e) => setHari(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {hariOptions.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>

            <select
              value={tanggal}
              onChange={(e) => setTanggal(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>

            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {bulanOptions.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {[2024, 2025, 2026, 2027].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* PAYMENT DATE */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Payment Date</h3>

            <div className="grid grid-cols-4 gap-3">
              {/* Day */}
              <select
                value={hariBayar}
                onChange={(e) => setHariBayar(e.target.value)}
                className="border rounded px-3 py-2"
              >
                {hariOptions.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>

              {/* Date */}
              <select
                value={tanggalBayar}
                onChange={(e) => setTanggalBayar(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>

              {/* Month */}
              <select
                value={bulanBayar}
                onChange={(e) => setBulanBayar(e.target.value)}
                className="border rounded px-3 py-2"
              >
                {bulanOptions.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={tahunBayar}
                onChange={(e) => setTahunBayar(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {[2024, 2025, 2026, 2027].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={saveLegalDates}
            disabled={processing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Simpan Tanggal Legal
          </button>
        </div>
      )}

      {/* DAFTAR KEGIATAN */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Daftar Kegiatan</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm"
          >
            Tambah Kegiatan
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left">Harga</th>
              <th className="px-4 py-3 text-left">Subtotal</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {spk.kegiatan.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3">{k.nama_kegiatan}</td>
                <td className="px-4 py-3">{k.volume}</td>
                <td className="px-4 py-3">
                  Rp {k.harga_satuan.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  Rp {k.nilai.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteItem(k.id)}
                    className="text-red-500 text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REQUEST TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Request Ketua</h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Kegiatan</th>
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left">Nilai</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pendingRequests.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Tidak ada request pending
                </td>
              </tr>
            ) : (
              pendingRequests.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.kegiatan.nama_kegiatan}</td>
                  <td className="px-4 py-3">{item.volume}</td>
                  <td className="px-4 py-3">
                    Rp {item.nilai.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => approveItem(item.id, "APPROVED")}
                      className="text-green-600 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => approveItem(item.id, "REJECTED")}
                      className="text-red-600 text-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl p-6">
        <p>Total Honorarium</p>
        <p className="text-2xl font-bold">
          Rp {spk.total_honorarium.toLocaleString("id-ID")}
        </p>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-[400px]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="mb-4 font-semibold">Tambah Kegiatan Manual</h3>

              <select
                value={selectedKegiatanId}
                onChange={(e) => setSelectedKegiatanId(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Pilih kegiatan</option>
                {kegiatanMaster.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kegiatan}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={addItem}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2"
                >
                  Simpan
                </button>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 rounded-lg py-2"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
