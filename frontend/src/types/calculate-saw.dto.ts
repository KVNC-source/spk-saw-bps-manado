/**
 * Payload for generating SPK (Surat Perjanjian Kerja)
 *
 * Digunakan oleh frontend untuk mengirim data pembuatan SPK
 * ke backend. Data ini bersifat kontraktual (bukan periodik).
 */
export interface GenerateSpkPayload {
  /** ID mitra terpilih (hasil perankingan SAW) */
  mitraId: number;

  /** Deskripsi pekerjaan */
  pekerjaan: string;

  /** Lokasi pekerjaan */
  lokasi: string;

  /** Nilai kontrak (dalam rupiah) */
  nilaiKontrak: number;

  /** Tanggal mulai kontrak (ISO string: YYYY-MM-DD) */
  tanggalMulai: string;

  /** Tanggal selesai kontrak (ISO string: YYYY-MM-DD) */
  tanggalSelesai: string;

  /**
   * Tanggal pembayaran honorarium
   * Ditulis dalam bentuk kata (contoh: "tiga puluh")
   * Digunakan pada redaksi Pasal 6 SPK
   */
  tanggalPembayaran: string;

  /**
   * Fallback period (opsional)
   * Digunakan jika backend masih membutuhkan konteks tahun/bulan
   */
  tahun?: number;
  bulan?: number;
}

export interface CalculateSawDto {
  tahun: number;
  bulan: number;
  spkRoleId: number;
  kegiatanIds: number[];
  tanggalMulai: string;
  tanggalSelesai: string;
}
