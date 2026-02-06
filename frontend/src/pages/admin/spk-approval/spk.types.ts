/* =========================
   SPK STATUS (ERASABLE-SAFE)
========================= */

export const SpkStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type SpkStatus = (typeof SpkStatus)[keyof typeof SpkStatus];

/* =========================
   SPK TYPE
========================= */

export interface Spk {
  id: number;
  nomor_spk: string;

  tahun: number;
  bulan: number;

  status: SpkStatus;

  total_honorarium: string;
  spk_kegiatan: string;

  mitra: {
    nama_mitra: string;
  };
}
