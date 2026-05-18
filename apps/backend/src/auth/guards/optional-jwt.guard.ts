import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that does NOT fail on missing/invalid tokens.
 * req.user will be populated when a valid token is present, otherwise null.
 * Use this on endpoints that work for both authenticated and anonymous users.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(_err: any, user: any) {
    return user ?? null;
  }
}
