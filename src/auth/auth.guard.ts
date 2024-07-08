import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';

import { GqlContext } from 'src/graphql/gql-context.interface';
import { AuthService } from './auth.service';

function canBypassAuth(context: ExecutionContext, reflector: Reflector) {
  return reflector.get('bypass_auth_check', context.getHandler());
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext) {
    if (canBypassAuth(context, this.reflector)) return true;

    if (context.getType<GqlContextType>() === 'http') {
      const request = context.switchToHttp().getRequest();
      const authContext = this.authService.getAuthContext(request);

      if (authContext?.jwt) {
        return true;
      }
    }

    const ctx = GqlExecutionContext.create(context).getContext<GqlContext>();

    if (ctx.jwt) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
