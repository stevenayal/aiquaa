import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { MailerService } from './mailer.service';

class NuevaEmpresaDto {
  companyName!: string;
  ownerName!: string;
  ownerEmail!: string;
  ruc?: string;
}

class CandidatoInvitacionDto {
  candidateEmail!: string;
  candidateName?: string;
  companyName!: string;
  positionName?: string;
  message?: string;
  invitacionUrl!: string;
}

@ApiExcludeController()
@Controller('mailer/interna')
export class MailerController {
  private readonly logger = new Logger(MailerController.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  @Post('nueva-empresa')
  @HttpCode(HttpStatus.OK)
  async nuevaEmpresa(
    @Headers('x-internal-secret') secret: string,
    @Body() body: NuevaEmpresaDto
  ) {
    const expected = this.configService.get<string>('INTERNAL_NOTIFY_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException();
    }

    const registeredAt = new Date().toLocaleString('es-PY', {
      timeZone: 'America/Asuncion',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await this.mailerService.sendNewEmpresaAlert({
      companyName: body.companyName,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      ruc: body.ruc,
      registeredAt,
    });

    this.logger.log(
      `Alerta nueva empresa disparada: ${body.companyName} <${body.ownerEmail}>`
    );
    return { ok: true };
  }

  @Post('candidato-invitacion')
  @HttpCode(HttpStatus.OK)
  async candidatoInvitacion(
    @Headers('x-internal-secret') secret: string,
    @Body() body: CandidatoInvitacionDto
  ) {
    const expected = this.configService.get<string>('INTERNAL_NOTIFY_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException();
    }

    await this.mailerService.sendCandidatoInvitacion({
      candidateEmail: body.candidateEmail,
      candidateName: body.candidateName,
      companyName: body.companyName,
      positionName: body.positionName,
      message: body.message,
      invitacionUrl: body.invitacionUrl,
    });

    this.logger.log(
      `Invitación enviada a <${body.candidateEmail}> de parte de ${body.companyName}`
    );
    return { ok: true };
  }
}
