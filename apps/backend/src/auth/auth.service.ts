import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, RequestResetDto, ResetPasswordDto } from './dto';
import { AuthResponseDto, RefreshResponseDto, MessageResponseDto } from './dto';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { MailerService } from '../mailer/mailer.service';

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

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'USER',
      },
    });

    // Generar token de verificación
    const verificationToken = await this.createVerificationToken(
      user.id,
      email,
      'VERIFY_EMAIL'
    );

    // Enviar email de verificación
    await this.mailerService.sendVerificationEmail(
      email,
      verificationToken.tokenHash,
      name || email
    );

    return {
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el email está verificado
    if (!user.emailVerifiedAt) {
      throw new BadRequestException('Por favor verifica tu email antes de iniciar sesión');
    }

    // Generar tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      // Verificar el token en la base de datos
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(refreshToken) },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Token de refresh inválido o expirado');
      }

      // Verificar si el token fue reemplazado (rotación)
      if (tokenRecord.replacedByTokenId) {
        // Detectar reuso - invalidar todos los tokens del usuario
        await this.prisma.refreshToken.updateMany({
          where: { userId: tokenRecord.userId },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Token de refresh reutilizado - sesión inválida');
      }

      // Revocar el token actual
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Generar nuevos tokens
      const newAccessToken = await this.generateAccessToken(tokenRecord.user);
      const newRefreshToken = await this.generateRefreshToken(tokenRecord.user);

      // Marcar el nuevo token como reemplazo del anterior
      const newTokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(newRefreshToken) }
      });
      
      if (newTokenRecord) {
        await this.prisma.refreshToken.update({
          where: { id: newTokenRecord.id },
          data: { replacedByTokenId: tokenRecord.id },
        });
      }

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
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

    // Enviar email de bienvenida (no bloqueante)
    try {
      await this.mailerService.sendWelcomeEmail(updatedUser.email, updatedUser.name || updatedUser.email);
    } catch (_) {
      // Ignorar error de envío para no afectar la verificación
    }

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
        verificationToken.tokenHash,
        user.name || email
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

    return user;
  }

  async generateAccessToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
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
          Date.now() + parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000
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
    type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'
  ) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    return this.prisma.verificationToken.create({
      data: {
        userId,
        email,
        type,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    });
  }

  private hashToken(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
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
