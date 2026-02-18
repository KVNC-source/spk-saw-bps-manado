import api from "./axios";

export type PerformanceResultItem = {
  mitraId: number;
  mitraNama: string;
  nilaiPreferensi: number;
  peringkat: number;
  kategori: string;
  summary: string;
};

export type PerformanceResponse = {
  tahun: number;
  bulan: number;
  metode: string;
  totalAlternatif: number;
  hasil: PerformanceResultItem[];
};

export const getPerformanceSaw = async (
  tahun: number,
  bulan: number,
): Promise<PerformanceResponse> => {
  const res = await api.get("/spk/saw/performance", {
    params: { tahun, bulan },
  });

  return res.data;
};
