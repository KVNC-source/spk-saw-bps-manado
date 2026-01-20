export type SawCriterion = {
  key: 'totalVolume' | 'totalNilai' | 'jumlahKegiatan';
  label: string;
  weight: number;
  type: 'BENEFIT' | 'COST';
};

export const SAW_CRITERIA: SawCriterion[] = [
  {
    key: 'totalVolume',
    label: 'Total Volume Pekerjaan',
    weight: 0.3,
    type: 'BENEFIT',
  },
  {
    key: 'totalNilai',
    label: 'Total Nilai Honor',
    weight: 0.5,
    type: 'BENEFIT',
  },
  {
    key: 'jumlahKegiatan',
    label: 'Jumlah Kegiatan',
    weight: 0.2,
    type: 'BENEFIT',
  },
];
