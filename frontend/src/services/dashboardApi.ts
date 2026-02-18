import api from "@/lib/axios";

/* =========================================================
   DASHBOARD SUMMARY
========================================================= */

export interface DashboardSummary {
  totalMitra: number;
  totalKegiatan: number;

  totalAlokasi: number;
  alokasiApproved: number;
  alokasiDraft: number;

  totalAnggaran: number;
  totalAnggaranApproved: number;

  lastSpk: {
    nomor_spk: string;
    tahun: number;
    bulan: number;
    created_at: string;
    mitra: {
      nama_mitra: string;
    };
  } | null;

  aktivitasTerakhir: {
    tanggal: string;
    kegiatan: string;
    mitra: string;
    status: string;
  }[];
}

/**
 * 🔒 Role-aware dashboard summary
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<DashboardSummary>("/spk/dashboard-summary");
  return res.data;
}

/* =========================================================
   MONTHLY ABSORPTION
========================================================= */

export interface MonthlyAbsorption {
  bulan: number;
  total: number;
}

export async function fetchMonthlyAbsorption(
  tahun: number,
): Promise<MonthlyAbsorption[]> {
  const res = await api.get<MonthlyAbsorption[]>(
    `/spk/monthly-absorption/${tahun}`,
  );
  return res.data;
}
