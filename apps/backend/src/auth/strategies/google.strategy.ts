import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    
    try {
      // Buscar si ya existe una cuenta OAuth de Google para este usuario
      let oauthAccount = await this.prisma.oAuthAccount.findFirst({
        where: {
          provider: 'GOOGLE',
          providerUserId: profile.id,
        },
        include: { user: true },
      });

      if (oauthAccount) {
        // Usuario ya existe, devolverlo
        return done(null, oauthAccount.user);
      }

      // Buscar si existe un usuario con el mismo email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: emails[0].value.toLowerCase() },
      });

      if (existingUser) {
        // Usuario existe pero no tiene cuenta OAuth de Google, crear la relación
        oauthAccount = await this.prisma.oAuthAccount.create({
          data: {
            provider: 'GOOGLE',
            providerUserId: profile.id,
            userId: existingUser.id,
          },
          include: { user: true },
        });

        return done(null, existingUser);
      }

      // Crear nuevo usuario
      const newUser = await this.prisma.user.create({
        data: {
          email: emails[0].value.toLowerCase(),
          name: name.givenName + ' ' + name.familyName,
          avatarUrl: photos[0]?.value,
          emailVerifiedAt: new Date(), // Google ya verifica el email
          role: 'USER',
          oauthAccounts: {
            create: {
              provider: 'GOOGLE',
              providerUserId: profile.id,
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
