// src/spk/types/dashboard-summary.type.ts
export type DashboardSummary = {
  totalMitra: number;
  totalKegiatan: number;
  totalAlokasi: number;
  alokasiApproved: number;
  alokasiDraft: number;
  totalAnggaran: number;
  totalAnggaranApproved: number;
  lastSpk: {
    id: number;
    nomor_spk: string;
    mitra: string;
    created_at: Date;
  } | null;
  aktivitasTerakhir: {
    tanggal: Date;
    kegiatan: string;
    mitra: string;
    status: string;
  }[];
};
