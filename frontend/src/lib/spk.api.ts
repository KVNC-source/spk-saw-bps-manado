import api from "@/lib/axios";

export interface GenerateSpkPayload {
  mitraId: number;
  pekerjaan: string;
  lokasi: string;
  nilaiKontrak: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  tahun?: number;
  bulan?: number;
}

/**
 * Generate SPK
 * - Accepts full SPK payload
 * - tahun & bulan are OPTIONAL
 */
export async function generateSPK(payload: GenerateSpkPayload) {
  const res = await api.post("/spk/generate", payload);
  return res.data;
}

export async function getSPKById(id: number) {
  const res = await api.get(`/admin/spk/${id}`);
  return res.data;
}

export function downloadSPKPdf(id: number) {
  window.open(`http://localhost:3000/spk/${id}/pdf`, "_blank");
}
