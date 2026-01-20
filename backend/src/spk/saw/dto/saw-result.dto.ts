import { SawRankingDto } from './saw-ranking.dto';

export class SawResultDto {
  readonly tahun: number;
  readonly bulan: number;
  readonly metode: 'SAW';
  readonly totalAlternatif: number;
  readonly hasil: SawRankingDto[];
}
