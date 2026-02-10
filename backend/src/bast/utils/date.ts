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

  const terbilang = (n: number): string => {
    const angka = [
      '',
      'satu',
      'dua',
      'tiga',
      'empat',
      'lima',
      'enam',
      'tujuh',
      'delapan',
      'sembilan',
      'sepuluh',
      'sebelas',
    ];

    if (n < 12) return angka[n];
    if (n < 20) return `${angka[n - 10]} belas`;
    if (n < 100) {
      const sisa = n % 10;
      return sisa === 0
        ? `${angka[Math.floor(n / 10)]} puluh`
        : `${angka[Math.floor(n / 10)]} puluh ${angka[sisa]}`;
    }
    return '';
  };

  return `Pada hari ini ${hari[date.getDay()]}, tanggal ${terbilang(
    date.getDate(),
  )}, bulan ${bulan[date.getMonth()]}`;
}
