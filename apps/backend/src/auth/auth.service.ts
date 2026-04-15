import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RequestResetDto, ResetPasswordDto } from './dto';
import { MessageResponseDto } from './dto';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { MailerService } from '../mailer/mailer.service';

interface AuthTokensResult {
  access_token: string | null;
  refresh_token: string | null;
  user: {
    id: number;
    email: string;
    name?: string;
    role: string;
    emailVerifiedAt?: Date;
  };
  requiresTwoFactor?: boolean;
  message?: string;
}

interface RefreshTokensResult {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<MessageResponseDto> {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'USER',
      },
    });

    const verificationToken = await this.createVerificationToken(
      user.id,
      email,
      'VERIFY_EMAIL',
    );

    await this.mailerService.sendVerificationEmail(
      email,
      verificationToken.token,
      name || email,
    );

    return {
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthTokensResult> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isTwoFactorEnabled = user.twoFASecret === 'EMAIL_2FA_ENABLED';

    if (isTwoFactorEnabled) {
      await this.sendTwoFactorCode(email);

      return {
        access_token: null,
        refresh_token: null,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt ?? undefined,
        },
        requiresTwoFactor: true,
        message: 'Se ha enviado un código de verificación a tu email',
      };
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt ?? undefined,
      },
    };
  }

  async refresh(refreshToken?: string): Promise<RefreshTokensResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresh no encontrado');
    }

    try {
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(refreshToken) },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Token de refresh inválido o expirado');
      }

      if (tokenRecord.replacedByTokenId) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: tokenRecord.userId },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Token de refresh reutilizado - sesión inválida');
      }

      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      const newAccessToken = await this.generateAccessToken(tokenRecord.user);
      const newRefreshToken = await this.generateRefreshToken(tokenRecord.user);

      const newTokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(newRefreshToken) },
      });

      if (newTokenRecord) {
        await this.prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { replacedByTokenId: newTokenRecord.id },
        });
      }

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async logout(userId: number): Promise<MessageResponseDto> {
    // Revocar todos los tokens de refresh del usuario
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Sesión cerrada exitosamente' };
  }

  async logoutFromDevice(userId: number, tokenId: number): Promise<MessageResponseDto> {
    // Revocar un token específico
    const token = await this.prisma.refreshToken.findFirst({
      where: { id: tokenId, userId },
    });

    if (!token) {
      throw new BadRequestException('Token no encontrado');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Dispositivo desconectado exitosamente' };
  }

  async getActiveSessions(userId: number) {
    // Obtener todas las sesiones activas del usuario
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ip: true,
        userAgent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async verifyEmail(token: string): Promise<MessageResponseDto> {
    const tokenRecord = await this.prisma.verificationToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!tokenRecord || tokenRecord.type !== 'VERIFY_EMAIL' || tokenRecord.consumedAt) {
      throw new BadRequestException('Token de verificación inválido');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token de verificación expirado');
    }

    // Marcar email como verificado
    const updatedUser = await this.prisma.user.update({
      where: { id: tokenRecord.userId! },
      data: { emailVerifiedAt: new Date() },
    });

    // Marcar token como consumido
    await this.prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });



    return { message: 'Email verificado exitosamente' };
  }

  async requestReset(requestResetDto: RequestResetDto): Promise<MessageResponseDto> {
    const { email } = requestResetDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      // Revocar tokens de reset anteriores no consumidos
      await this.prisma.verificationToken.updateMany({
        where: {
          userId: user.id,
          type: 'RESET_PASSWORD',
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      });

      // Generar nuevo token de reset
      const verificationToken = await this.createVerificationToken(
        user.id,
        email,
        'RESET_PASSWORD'
      );

      // Enviar email de reset
      await this.mailerService.sendPasswordResetEmail(
        email,
        verificationToken.token,
        user.name || email,
      );
    }

    // Siempre devolver el mismo mensaje por seguridad
    return {
      message: 'Si el email existe, se enviará un enlace para restablecer la contraseña',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    const { token, password: newPassword } = resetPasswordDto;

    const tokenRecord = await this.prisma.verificationToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!tokenRecord || tokenRecord.type !== 'RESET_PASSWORD' || tokenRecord.consumedAt) {
      throw new BadRequestException('Token de reset inválido');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token de reset expirado');
    }

    // Hash de la nueva contraseña
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: tokenRecord.userId! },
      data: { passwordHash },
    });

    // Marcar token como consumido
    await this.prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });

    // Revocar todos los tokens de refresh del usuario
    await this.prisma.refreshToken.updateMany({
      where: { userId: tokenRecord.userId! },
      data: { revokedAt: new Date() },
    });

    return { message: 'Contraseña restablecida exitosamente' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<MessageResponseDto> {
    // Verificar contraseña actual
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await argon2.verify(user.passwordHash, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revocar todos los tokens de refresh del usuario (forzar re-login)
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Contraseña cambiada exitosamente' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        emailVerifiedAt: true,
        twoFASecret: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      ...user,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      emailVerifiedAt: user.emailVerifiedAt ?? undefined,
      twoFASecret: user.twoFASecret ?? undefined,
    };
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TTL', '900'),
    });
  }

  async generateRefreshToken(user: any): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    // Guardar token en la base de datos
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000'), 10) * 1000,
        ),
        ip: this.getClientIP(), // Agregar IP del cliente
        userAgent: this.getUserAgent(), // Agregar User-Agent
      },
    });

    return token;
  }

  private async createVerificationToken(
    userId: number,
    email: string,
    type: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
  ): Promise<{ token: string; record: { id: number } }> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    const record = await this.prisma.verificationToken.create({
      data: {
        userId,
        email,
        type,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: { id: true },
    });

    return { token, record };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getClientIP(): string | undefined {
    // En un entorno real, esto vendría del contexto de la request
    // Por ahora retornamos undefined
    return undefined;
  }

  private getUserAgent(): string | undefined {
    // En un entorno real, esto vendría del contexto de la request
    // Por ahora retornamos undefined
    return undefined;
  }

  async sendTwoFactorCode(email: string): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Revocar códigos 2FA anteriores no consumidos
    await this.prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: 'TWO_FACTOR_EMAIL',
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = this.hashToken(code);

    // Crear token de verificación con el código
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        type: 'TWO_FACTOR_EMAIL',
        tokenHash: codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
      },
    });

    return {
      message: 'Código de verificación enviado a tu email',
    };
  }

  async verifyTwoFactorCode(email: string, code: string): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const tokenRecord = await this.prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: 'TWO_FACTOR_EMAIL',
        tokenHash: this.hashToken(code),
        consumedAt: null,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Código de verificación inválido');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Código de verificación expirado');
    }

    // Marcar código como consumido
    await this.prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });

    return {
      message: 'Código de verificación válido',
    };
  }

  async completeTwoFactorLogin(email: string, code: string): Promise<AuthTokensResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const tokenRecord = await this.prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: 'TWO_FACTOR_EMAIL',
        tokenHash: this.hashToken(code),
        consumedAt: null,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Código de verificación inválido');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Código de verificación expirado');
    }

    // Marcar código como consumido
    await this.prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { consumedAt: new Date() },
    });

    // Generar tokens de acceso
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt ?? undefined,
      },
    };
  }

  async enableTwoFactorEmail(userId: number): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Marcar que el usuario tiene 2FA habilitado por email
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: 'EMAIL_2FA_ENABLED' },
    });

    return {
      message: 'Verificación de segundo factor por email habilitada',
    };
  }

  async disableTwoFactorEmail(userId: number): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Deshabilitar 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: null },
    });

    // Revocar todos los tokens 2FA pendientes
    await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type: 'TWO_FACTOR_EMAIL',
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    return {
      message: 'Verificación de segundo factor por email deshabilitada',
    };
  }

  async isTwoFactorEnabled(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true },
    });

    return user?.twoFASecret === 'EMAIL_2FA_ENABLED';
  }

  async cleanupExpiredTokens(): Promise<void> {
    // Limpiar tokens de verificación expirados
    await this.prisma.verificationToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Limpiar tokens de refresh expirados o revocados
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }
}
