import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [PrismaModule, JwtModule],
    providers: [SettingsService, EncryptionService],
    controllers: [SettingsController],
    exports: [SettingsService],
})
export class SettingsModule { }
