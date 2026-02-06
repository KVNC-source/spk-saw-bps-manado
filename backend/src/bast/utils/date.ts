export function formatTanggalIndonesia(date: Date): string {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return `Pada hari ini ${hari[date.getDay()]}, tanggal ${date.getDate()}, bulan ${bulan[date.getMonth()]} tahun ${date.getFullYear()}`;
}
