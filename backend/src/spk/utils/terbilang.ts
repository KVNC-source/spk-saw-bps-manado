export function terbilang(n: number): string {
  const angka = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function toWords(x: number): string {
    if (x < 12) return angka[x];
    if (x < 20) return toWords(x - 10) + ' Belas';
    if (x < 100)
      return toWords(Math.floor(x / 10)) + ' Puluh ' + toWords(x % 10);
    if (x < 200) return 'Seratus ' + toWords(x - 100);
    if (x < 1000)
      return toWords(Math.floor(x / 100)) + ' Ratus ' + toWords(x % 100);
    if (x < 2000) return 'Seribu ' + toWords(x - 1000);
    if (x < 1_000_000)
      return toWords(Math.floor(x / 1000)) + ' Ribu ' + toWords(x % 1000);
    if (x < 1_000_000_000)
      return (
        toWords(Math.floor(x / 1_000_000)) + ' Juta ' + toWords(x % 1_000_000)
      );

    return '';
  }

  return toWords(n).replace(/\s+/g, ' ').trim() + ' Rupiah';
}
