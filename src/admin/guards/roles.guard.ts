import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator is present, access is granted (no role check needed)
    if (!requiredRoles) {
      return true;
    }

    // Get the user from the request (injected by your AuthGuard/middleware)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check if the user's single role is included in the required roles array.
    const hasRequiredRole = requiredRoles.includes(user.role);

    return hasRequiredRole;
  }
}
