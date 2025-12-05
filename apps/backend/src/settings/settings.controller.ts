import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll(@Query('module') module?: string) {
        return this.settingsService.findAll(module);
    }

    @Get(':key')
    findOne(@Param('key') key: string) {
        return this.settingsService.findOne(key);
    }

    @Patch(':key')
    update(
        @Param('key') key: string,
        @Body() updateSettingDto: UpdateSettingDto,
        @Req() req: any
    ) {
        // req.user is populated by JwtAuthGuard
        // req.ip is standard express
        return this.settingsService.update(key, updateSettingDto, req.user?.userId, req.ip);
    }

    @Post('bulk')
    updateBulk(
        @Body() settings: UpdateSettingDto[],
        @Req() req: any
    ) {
        return this.settingsService.updateBulk(settings, req.user?.userId, req.ip);
    }
}
