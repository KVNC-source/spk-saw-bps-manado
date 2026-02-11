import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
    name: string;
    role: 'ADMIN' | 'MITRA' | 'KETUA_TIM';
    mitra_id?: number | null;
  };
}
