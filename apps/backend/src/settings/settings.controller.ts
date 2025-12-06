import { Controller, Get, Patch, Post, Body, Param, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async findAll(@Query('includeSystem') includeSystem: string) {
        return this.settingsService.findAll(includeSystem === 'true');
    }

    @Get(':key')
    async findOne(@Param('key') key: string) {
        // Note: Secrets are masked by default in service
        return this.settingsService.findByKey(key);
    }

    @Patch(':key')
    async update(
        @Param('key') key: string,
        @Body('value') value: any,
        @Req() req: any,
    ) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        // value is expected to be the raw value, service handles JSON stringify if needed
        // based on frontend sending { value: "someval" } or { value: true }
        return this.settingsService.update(key, value, req.user);
    }

    @Get(':key/history')
    async getHistory(@Param('key') key: string) {
        return this.settingsService.getHistory(key);
    }

    @Get('data/export')
    @Roles('ADMIN')
    async export() {
        return this.settingsService.exportSettings();
    }

    @Post('data/import')
    @Roles('ADMIN')
    async import(@Body() data: any[], @Req() req: any) {
        return this.settingsService.importSettings(data, req.user);
    }
}
