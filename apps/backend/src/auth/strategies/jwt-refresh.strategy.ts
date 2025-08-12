import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
          return request?.cookies?.[cookieName];
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      // Verificar que el usuario existe y no está eliminado
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar que el token de refresh existe y no está revocado
      const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
      const refreshToken = req.cookies?.[cookieName];
      
      if (!refreshToken) {
        throw new UnauthorizedException('Token de refresh no encontrado');
      }

      // Hash del token para buscar en la base de datos
      const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
      
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Token de refresh inválido o expirado');
      }

      // Agregar el usuario al request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      };

      return req.user;
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }
}
