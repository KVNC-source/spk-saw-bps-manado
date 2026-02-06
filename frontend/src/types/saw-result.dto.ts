export interface SawResultItem {
  id: number;
  mitraNama: string;
  nilaiAkhir: number;
  peringkat: number;
}

export interface SawResultDto {
  results: SawResultItem[];
}
