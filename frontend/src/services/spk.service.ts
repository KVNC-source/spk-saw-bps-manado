/**
 * Frontend SPK Service
 * ----------------------------------
 * Handles all HTTP communication
 * related to SPK & BAST features.
 *
 * This file acts as the SPK API layer
 * on the frontend.
 */

const API_URL = `${import.meta.env.VITE_API_URL}/spk`;

/**
 * Get JWT token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem("access_token");
}

/**
 * =========================
 * PDF
 * =========================
 */

/**
 * Build SPK PDF URL
 * Backend route: GET /spk/:id/pdf
 */
export function getSpkPdfUrl(spkId: number): string {
  return `${API_URL}/${spkId}/pdf`;
}

/**
 * =========================
 * GENERATE SPK & BAST
 * =========================
 */

/**
 * Generate SPK & BAST from approved alokasi
 * Backend route: POST /spk/generate
 */
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
