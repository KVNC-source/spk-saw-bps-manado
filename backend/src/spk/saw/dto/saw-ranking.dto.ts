export class SawRankingDto {
  readonly mitraId: number;
  readonly mitraNama: string;
  readonly nilaiPreferensi: number;
  readonly peringkat: number;
  readonly detail: Record<
    string,
    {
      nilaiAsli: number;
      normalized: number;
      bobot: number;
      kontribusi: number;
    }
  >;
}
