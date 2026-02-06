export interface CalculateSawDto {
  tahun: number;
  bulan: number;
  spkRoleId: number;

  kegiatanIds: number[];

  tanggalMulai: string; // ISO date string
  tanggalSelesai: string; // ISO date string
}
