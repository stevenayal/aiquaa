import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {}
