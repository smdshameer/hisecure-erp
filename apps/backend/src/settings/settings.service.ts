import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll(module?: string, includeSecrets: boolean = false) {
        let where: any = {};
        if (module) {
            where.category = module;
        }

        const settings = await this.prisma.setting.findMany({
            where,
            orderBy: { key: 'asc' },
        });

        // Mask secrets if not explicitly requested (or authorized)
        if (!includeSecrets) {
            return settings.map(s => {
                if (s.isSecret) {
                    return { ...s, value: '********' };
                }
                return s;
            });
        }
        return settings;
    }

    async findOne(key: string, includeSecrets: boolean = false) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundException(`Setting with key ${key} not found`);
        }

        if (setting.isSecret && !includeSecrets) {
            return { ...setting, value: '********' };
        }

        return setting;
    }

    async getValue<T>(key: string, defaultValue?: T): Promise<T> {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!setting && defaultValue !== undefined) return defaultValue;
        if (!setting) return null as T;

        try {
            // Parse based on explicit 'type' field rather than guessing
            if (setting.type === 'BOOLEAN') return (setting.value === 'true') as unknown as T;
            if (setting.type === 'NUMBER') return Number(setting.value) as unknown as T;
            if (setting.type === 'JSON') return JSON.parse(setting.value) as unknown as T;
            return setting.value as unknown as T;
        } catch {
            return setting.value as unknown as T;
        }
    }

    async update(key: string, updateSettingDto: UpdateSettingDto, userId?: number, ipAddress?: string) {
        const existing = await this.prisma.setting.findUnique({
            where: { key },
        });

        if (!existing) {
            // Create new setting
            const newSetting = await this.prisma.setting.create({
                data: {
                    key,
                    value: updateSettingDto.value,
                    category: updateSettingDto.module || 'SYSTEM',
                    description: updateSettingDto.description,
                    type: this.inferType(updateSettingDto.value), // Auto-infer type if not specified
                    version: 1,
                }
            });

            // Initial History
            await this.prisma.settingHistory.create({
                data: {
                    settingId: newSetting.id,
                    newValue: updateSettingDto.value,
                    version: 1,
                    changedBy: userId,
                }
            });

            // Audit
            await this.prisma.auditLog.create({
                data: {
                    action: 'CREATE_SETTING',
                    entity: 'Setting',
                    entityId: key,
                    newValue: updateSettingDto.value,
                    userId: userId,
                    ipAddress: ipAddress,
                }
            });

            return newSetting;
        }

        // Logic for Secret updates:
        // If it's a secret and the new value is '********', IGNORE the update (user didn't change it).
        if (existing.isSecret && updateSettingDto.value === '********') {
            return existing;
        }

        // Update with Versioning
        const newVersion = existing.version + 1;

        const updated = await this.prisma.setting.update({
            where: { key },
            data: {
                value: updateSettingDto.value,
                description: updateSettingDto.description,
                version: newVersion,
            },
        });

        // Create History Entry
        await this.prisma.settingHistory.create({
            data: {
                settingId: existing.id,
                oldValue: existing.value,
                newValue: updateSettingDto.value,
                version: newVersion,
                changedBy: userId,
            }
        });

        // Audit Log
        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_SETTING',
                entity: 'Setting',
                entityId: key,
                oldValue: existing.isSecret ? '********' : existing.value,
                newValue: existing.isSecret ? '********' : updateSettingDto.value,
                userId: userId,
                ipAddress: ipAddress,
            }
        });

        return updated;
    }

    async getHistory(key: string) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
            include: {
                history: {
                    orderBy: { version: 'desc' },
                    include: {
                        // Ideally we would include User info via changedBy, 
                        // but schema relational link needs to be verified or created.
                        // For now just raw history.
                    }
                }
            }
        });

        if (!setting) throw new NotFoundException('Setting not found');

        // Don't leak secret history values
        if (setting.isSecret) {
            return setting.history.map(h => ({
                ...h,
                oldValue: '********',
                newValue: '********'
            }));
        }

        return setting.history;
    }

    // rollback method placeholder
    async rollback(key: string, targetVersion: number, userId: number, ipAddress: string) {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
            include: { history: true }
        });
        if (!setting) throw new NotFoundException('Setting not found');

        const historicalEntry = setting.history.find(h => h.version === targetVersion);
        if (!historicalEntry) throw new BadRequestException(`Version ${targetVersion} not found in history`);

        // Perform update to "new" value which is the old value
        // We do strictly create a NEW version rather than deleting history
        return this.update(key, {
            value: historicalEntry.newValue, // The value at that version
            module: setting.category,
            description: setting.description
        }, userId, ipAddress);
    }

    private inferType(value: string): string {
        if (value === 'true' || value === 'false') return 'BOOLEAN';
        if (!isNaN(Number(value)) && value.trim() !== '') return 'NUMBER';
        try {
            JSON.parse(value);
            // It parses as JSON, but could be a simple number/string. 
            // If it starts with { or [, assume JSON object
            if (value.trim().startsWith('{') || value.trim().startsWith('[')) return 'JSON';
        } catch { }
        return 'STRING';
    }
}
