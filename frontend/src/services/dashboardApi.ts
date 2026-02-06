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

export async function fetchDashboardSummary() {
  const token = localStorage.getItem("access_token");
  console.log("Dashboard token:", token);

  const res = await fetch("http://localhost:3000/spk/dashboard-summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(err);
    throw new Error("Unauthorized");
  }

  return res.json();
}
