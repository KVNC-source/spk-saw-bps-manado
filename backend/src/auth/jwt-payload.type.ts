import { Role } from '@prisma/client';

export interface JwtPayload {
  id: string;
  name: string;
  role: Role;
  mitra_id: number | null;
}
