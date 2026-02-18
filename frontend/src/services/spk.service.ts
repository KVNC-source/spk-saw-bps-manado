/**
 * Frontend SPK Service
 * ----------------------------------
 * Handles all HTTP communication
 * related to SPK & BAST features.
 */

const API_URL = `${import.meta.env.VITE_API_URL}/spk`;

/**
 * Get JWT token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

/* =====================================================
   TYPES
===================================================== */

export interface SpkItem {
  id: number;
  nomorSpk: string;
  mitraNama: string;
  periode: string;
  totalNilai: number;
  peringkat: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

/* =====================================================
   GET ALL SPK (ADMIN APPROVAL PAGE)
   Backend: GET /spk
===================================================== */

/* =====================================================
   BACKEND RESPONSE TYPE
===================================================== */

interface BackendSpkResponse {
  id: number;
  nomor_spk: string;
  tahun: number;
  bulan: number;
  total_honorarium: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  mitra: {
    nama_mitra: string;
  };
}

/* =====================================================
   GET ALL SPK (ADMIN)
===================================================== */

export async function getAllSpk(): Promise<SpkItem[]> {
  const res = await fetch(`${API_URL}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data SPK");
  }

  const raw: BackendSpkResponse[] = await res.json();

  return raw.map((spk) => ({
    id: spk.id,
    nomorSpk: spk.nomor_spk,
    mitraNama: spk.mitra?.nama_mitra ?? "-",
    periode: `${spk.bulan}/${spk.tahun}`,
    totalNilai: Number(spk.total_honorarium ?? 0),
    peringkat: 0, // adjust if backend sends this later
    status: spk.status,
  }));
}

/* =====================================================
   PDF
   Backend: GET /spk/:id/pdf
===================================================== */

export function getSpkPdfUrl(spkId: number): string {
  return `${API_URL}/${spkId}/pdf`;
}

/* =====================================================
   GENERATE SPK & BAST
   Backend: POST /spk/generate
===================================================== */

export async function generateSpk(payload: {
  tahun: number;
  bulan: number;
}): Promise<{
  spkId: number;
  nomor_spk: string;
}> {
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Gagal generate SPK & BAST");
  }

  return res.json();
}
