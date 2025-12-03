import { Module } from '@nestjs/common';
import { JavelinController } from './javelin.controller';
import { JavelinService } from './javelin.service';

@Module({
    controllers: [JavelinController],
    providers: [JavelinService],
})
export class JavelinModule { }
