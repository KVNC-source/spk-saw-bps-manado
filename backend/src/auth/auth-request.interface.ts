import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user: {
    id: string;
    name: string;
    role: Role; // 🔥 MUST BE Role enum
    mitra_id?: number | null;
  };
}
