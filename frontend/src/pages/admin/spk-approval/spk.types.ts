/* =========================
   SPK STATUS (ERASABLE-SAFE)
========================= */

export const SpkStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type SpkStatus = (typeof SpkStatus)[keyof typeof SpkStatus];

/* =========================
   SPK BASE TYPE (LIST / APPROVAL)
========================= */

export interface Spk {
  id: number;
  nomor_spk: string;

  tahun: number;
  bulan: number;

  status: SpkStatus;

  total_honorarium: number;
  spk_kegiatan: string;

  /* ===== BASIC MITRA INFO ===== */
  mitra: {
    id: number;
    nama_mitra: string;
  };

  /* ===== CREATOR ===== */
  created_by_user_name?: string | null;
}

/* =========================
   SPK KEGIATAN ITEM (DETAIL)
========================= */

export interface SpkKegiatanItem {
  id: number;
  nama_kegiatan: string;
  volume: number;
  harga_satuan: number;
  nilai: number;

  mata_anggaran?: {
    kode: string;
    nama: string;
  } | null;
}

/* =========================
   MATA ANGGARAN TYPE
========================= */

export interface MataAnggaran {
  id: number;
  kode: string;
  nama: string;
}

/* =========================
   FULL MITRA DETAIL
========================= */

export interface MitraDetail {
  id: number;
  nama_mitra: string;
  alamat?: string | null;
  no_hp?: string | null;
  email?: string | null;
}

/* =========================
   SPK DETAIL TYPE (FULL HYDRATED)
========================= */

export interface SpkDetail extends Spk {
  /* ===== KEGIATAN ===== */
  kegiatan: SpkKegiatanItem[];

  /* ===== PERIOD ===== */
  tanggal_mulai: string;
  tanggal_selesai: string;

  /* ===== LEGAL ===== */
  tanggal_perjanjian?: string | null;
  tanggal_pembayaran?: string | null;

  /* ===== MATA ANGGARAN ===== */
  mata_anggaran?: MataAnggaran | null;

  /* ===== ADMIN ===== */
  admin_note?: string | null;

  /* ===== FULL MITRA OVERRIDE ===== */
  mitra: MitraDetail;
}
