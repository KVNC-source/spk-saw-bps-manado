import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No role restriction → allow
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Role tidak ditemukan');
    }

    const userRole = String(user.role).toUpperCase();
    const allowedRoles = requiredRoles.map((r) => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke endpoint ini');
    }

    return true;
  }
}
