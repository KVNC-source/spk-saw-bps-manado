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
   SPK TYPE (LIST / APPROVAL)
========================= */

export interface Spk {
  id: number;
  nomor_spk: string;

  tahun: number;
  bulan: number;

  status: SpkStatus;

  total_honorarium: number;
  spk_kegiatan: string;

  mitra: {
    nama_mitra: string;
  };
}

/* =========================
   SPK KEGIATAN ITEM (DETAIL)
========================= */

export interface SpkKegiatanItem {
  id: number; // spk_document_item.id
  nama_kegiatan: string;
  volume: number;
  harga_satuan: number;
  nilai: number;
}

/* =========================
   SPK DETAIL TYPE
========================= */

export interface SpkDetail extends Spk {
  kegiatan: SpkKegiatanItem[];
}
