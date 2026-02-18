import api from "./axios";

/* ================================
   TYPES
================================ */

export interface AdminSpkItem {
  id: number;
  tahun: number;
  bulan: number;
  nomor_spk: string;
  status: string;
  total_honorarium: number;
  tanggal_pembayaran?: string;
  created_by_user_name: string;
  mitra: {
    nama_mitra: string;
  };
}

/* ================================
   GET ALL SPK (ADMIN)
================================ */

export async function getAllSpk(): Promise<AdminSpkItem[]> {
  const res = await api.get("/spk");
  return res.data;
}

/* ================================
   APPROVE
================================ */

export async function approveSpk(id: number) {
  await api.patch(`/spk/${id}/approve`);
}
