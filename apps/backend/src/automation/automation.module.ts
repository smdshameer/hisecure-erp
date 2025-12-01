import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [MailModule, PrismaModule],
    providers: [AutomationService],
})
export class AutomationModule { }
