import { Controller, Get, Patch, Body, Param, Query, UseGuards, Req, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll(@Query('module') module?: string) {
        return this.settingsService.findAll(module, false);
    }

    @Get('export')
    export() {
        return this.settingsService.findAll(undefined, false);
    }

    @Post('bulk')
    updateBulk(@Body() updateSettingsDto: UpdateSettingDto[], @Req() req) {
        return this.settingsService.updateBulk(updateSettingsDto, req.user?.userId, req.ip);
    }

    @Get(':key')
    findOne(@Param('key') key: string) {
        return this.settingsService.findOne(key, false);
    }

    @Patch(':key')
    update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto, @Req() req) {
        return this.settingsService.update(key, updateSettingDto, req.user?.userId, req.ip);
    }

    @Get(':key/history')
    getHistory(@Param('key') key: string) {
        return this.settingsService.getHistory(key);
    }

    @Post(':key/rollback')
    rollback(@Param('key') key: string, @Body('version') version: number, @Req() req) {
        return this.settingsService.rollback(key, version, req.user?.userId, req.ip);
    }
}
