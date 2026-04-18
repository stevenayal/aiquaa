import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { username, displayName, photos, emails } = profile;
    
    try {
      // Buscar si ya existe una cuenta OAuth de GitHub para este usuario
      let oauthAccount = await this.prisma.oAuthAccount.findFirst({
        where: {
          provider: 'GITHUB',
          providerUserId: profile.id.toString(),
        },
        include: { user: true },
      });

      if (oauthAccount) {
        // Usuario ya existe, devolverlo
        return done(null, oauthAccount.user);
      }

      // Buscar si existe un usuario con el mismo email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: emails[0]?.value?.toLowerCase() || `${username}@github.com` },
      });

      if (existingUser) {
        // Usuario existe pero no tiene cuenta OAuth de GitHub, crear la relación
        oauthAccount = await this.prisma.oAuthAccount.create({
          data: {
            provider: 'GITHUB',
            providerUserId: profile.id.toString(),
            userId: existingUser.id,
          },
          include: { user: true },
        });

        return done(null, existingUser);
      }

      // Crear nuevo usuario
      const newUser = await this.prisma.user.create({
        data: {
          email: emails[0]?.value?.toLowerCase() || `${username}@github.com`,
          name: displayName || username,
          avatarUrl: photos[0]?.value,
          emailVerifiedAt: emails[0]?.value ? new Date() : null, // Solo verificar si hay email real
          role: 'USER',
          oauthAccounts: {
            create: {
              provider: 'GITHUB',
              providerUserId: profile.id.toString(),
            },
          },
        },
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
}
