export interface JwtPayload {
  sub: number;
  mitra_id: number;
  role: 'ADMIN' | 'MITRA';
}
