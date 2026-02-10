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
   * Fallback period (opsional)
   * Digunakan jika backend masih membutuhkan konteks tahun/bulan
   */
  tahun?: number;
  bulan?: number;
}
