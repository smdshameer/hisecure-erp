import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll(module?: string) {
        if (module) {
            return this.prisma.systemSetting.findMany({
                where: { module },
                orderBy: { key: 'asc' },
            });
        }
        return this.prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }

    async findOne(key: string) {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new NotFoundException(`Setting with key ${key} not found`);
        }
        return setting;
    }

    // Helper to get value directly (typed)
    async getValue<T>(key: string, defaultValue?: T): Promise<T> {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!setting && defaultValue !== undefined) return defaultValue;
        if (!setting) return null as T;

        try {
            // Try parsing boolean/number from string if it looks like JSON
            // Simple heuristic: "true"/"false" -> boolean, numbers -> number
            if (setting.value === 'true') return true as unknown as T;
            if (setting.value === 'false') return false as unknown as T;
            if (!isNaN(Number(setting.value)) && setting.value.trim() !== '') return Number(setting.value) as unknown as T;
            return setting.value as unknown as T;
        } catch {
            return setting.value as unknown as T;
        }
    }

    async update(key: string, updateSettingDto: UpdateSettingDto, userId?: number, ipAddress?: string) {
        const existing = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!existing) {
            // Create if not exists (upsert logic basically, but we want to audit)
            const newSetting = await this.prisma.systemSetting.create({
                data: {
                    key,
                    value: updateSettingDto.value,
                    module: updateSettingDto.module || 'SYSTEM',
                    description: updateSettingDto.description,
                }
            });

            // Audit Log
            await this.prisma.auditLog.create({
                data: {
                    action: 'CREATE_SETTING',
                    entity: 'SystemSetting',
                    entityId: key,
                    newValue: updateSettingDto.value,
                    userId: userId,
                    ipAddress: ipAddress,
                }
            });

            return newSetting;
        }

        // Update
        const updated = await this.prisma.systemSetting.update({
            where: { key },
            data: {
                value: updateSettingDto.value,
                description: updateSettingDto.description, // Optional update
            },
        });

        // Audit Log
        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_SETTING',
                entity: 'SystemSetting',
                entityId: key,
                oldValue: existing.value,
                newValue: updateSettingDto.value,
                userId: userId,
                ipAddress: ipAddress,
            }
        });

        return updated;
    }

    async updateBulk(settings: UpdateSettingDto[], userId?: number, ipAddress?: string) {
        const results = [];
        for (const setting of settings) {
            results.push(await this.update(setting.key, setting, userId, ipAddress));
        }
        return results;
    }
}
