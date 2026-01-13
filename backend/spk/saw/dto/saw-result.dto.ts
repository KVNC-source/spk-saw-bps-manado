import { SawRankingDto } from './saw-ranking.dto';

export class SawResultDto {
  readonly periodeId: string;
  readonly metode: 'SAW';
  readonly totalAlternatif: number;
  readonly hasil: SawRankingDto[];
}
