import api from "@/lib/axios";

/* =====================================================
   TYPES
===================================================== */

export interface KetuaDashboardSummary {
  totalSpk: number;
  approved: number;
  pending: number;
}

export interface SpkListItem {
  id: number;
  tahun: number;
  bulan: number;
  nomor_spk: string;
  status: string;
  mitra: {
    nama_mitra: string;
  };
}

export interface SpkDetail {
  id: number;
  nomor_spk: string;
  tahun: number;
  bulan: number;
  spk_kegiatan: string;
  status: string;

  mitra: {
    id: number;
    nama_mitra: string;
    alamat: string;
  };

  tanggal_mulai: string;
  tanggal_selesai: string;
  total_honorarium: number;

  kegiatan: {
    id: number;
    nama_kegiatan: string;
    volume: number;
    harga_satuan: number;
    nilai: number;
  }[];
}

/* =====================================================
   ================= ADMIN SECTION =====================
===================================================== */

/* ---------- DASHBOARD ---------- */
export async function getAdminDashboard() {
  const res = await api.get("/spk/dashboard-summary");
  return res.data;
}

/* ---------- SPK LIST ---------- */
export async function getAllSpk(): Promise<SpkListItem[]> {
  const res = await api.get("/spk");
  return res.data;
}

/* ---------- SPK DETAIL ---------- */
export async function getAdminSpkById(id: number): Promise<SpkDetail> {
  const res = await api.get(`/spk/${id}`);
  return res.data;
}

/* ---------- APPROVAL ---------- */
export async function getRequestItems(spkId: number) {
  const res = await api.get(`/spk/${spkId}/request-items`);
  return res.data;
}

export async function approveRequestItem(
  itemId: number,
  status: "APPROVED" | "REJECTED",
) {
  const res = await api.patch(`/spk/request-item/${itemId}`, { status });
  return res.data;
}

export async function finalizeSpk(id: number) {
  const res = await api.post(`/spk/${id}/finalize`);
  return res.data;
}

/* ---------- DELETE SPK ---------- */
export async function deleteSpk(id: number) {
  const res = await api.delete(`/spk/${id}`);
  return res.data;
}

/* ---------- KETUA MANAGEMENT (ADMIN) ---------- */
export async function getAllKetua() {
  const res = await api.get("/spk/ketua");
  return res.data;
}

export async function createKetua(payload: {
  username: string;
  name: string;
  password: string;
  email?: string;
  mitra_id?: number;
}) {
  const res = await api.post("/spk/ketua", payload);
  return res.data;
}

export async function updateKetua(
  id: string,
  payload: {
    username?: string;
    name?: string;
    email?: string;
    mitra_id?: number;
  },
) {
  const res = await api.patch(`/spk/ketua/${id}`, payload);
  return res.data;
}

export async function deleteKetua(id: string) {
  const res = await api.delete(`/spk/ketua/${id}`);
  return res.data;
}

/* =====================================================
   ================= KETUA SECTION =====================
===================================================== */

/* ---------- DASHBOARD ---------- */
export async function getKetuaDashboard(): Promise<KetuaDashboardSummary> {
  const res = await api.get("/ketua/spk/summary");
  return res.data;
}

/* ---------- MY SPK LIST ---------- */
export async function getMySpk(): Promise<SpkListItem[]> {
  const res = await api.get("/ketua/spk");
  return res.data;
}

/* ---------- DETAIL ---------- */
export async function getKetuaSpkById(id: number): Promise<SpkDetail> {
  const res = await api.get(`/ketua/spk/${id}`);
  return res.data;
}

/* ---------- CANCEL ---------- */
export async function cancelSpk(id: number) {
  const res = await api.patch(`/ketua/spk/${id}/cancel`);
  return res.data;
}

/* ---------- PDF ---------- */
export function downloadAdminSpkPdf(id: number) {
  window.open(`/spk/${id}/pdf`, "_blank");
}

export function downloadKetuaSpkPdf(id: number) {
  window.open(`/ketua/spk/${id}/pdf`, "_blank");
}
