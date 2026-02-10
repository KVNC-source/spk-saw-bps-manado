import api from "@/lib/axios";

export interface DashboardSummary {
  // MASTER
  totalMitra: number;
  totalKegiatan: number;

  // ALOKASI
  totalAlokasi: number;
  alokasiApproved: number;
  alokasiDraft: number;

  // FINANCIAL
  totalAnggaran: number;
  totalAnggaranApproved: number;

  // SPK
  lastSpk: {
    nomor_spk: string;
    tahun: number;
    bulan: number;
    created_at: string;
    mitra: {
      nama_mitra: string;
    };
  } | null;

  // ACTIVITY
  aktivitasTerakhir: {
    tanggal: string;
    kegiatan: string;
    mitra: string;
    status: string;
  }[];
}

/**
 * 🔒 Role-aware dashboard summary
 * Backend decides what data you get
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<DashboardSummary>("/spk/dashboard-summary");
  return res.data;
}
