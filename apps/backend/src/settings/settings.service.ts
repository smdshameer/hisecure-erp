import { Injectable, NotFoundException, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Setting, SettingHistory } from '@prisma/client';
import { EncryptionService } from './encryption.service';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
    ) { }

    async onModuleInit() {
        await this.seedSettings();
    }

    async findAll(includeSystem = false): Promise<Setting[]> {
        const where = includeSystem ? {} : { isSystem: false };
        const settings = await this.prisma.setting.findMany({
            where,
            orderBy: { category: 'asc' },
        });

        // Mask secrets
        return settings.map(s => {
            if (s.type === 'secret') {
                return { ...s, value: '********' };
            }
            return s;
        });
    }

    async findByKey(key: string): Promise<Setting> {
        const setting = await this.prisma.setting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new NotFoundException(`Setting with key ${key} not found`);
        }

        if (setting.type === 'secret') {
            return { ...setting, value: '********' };
        }

        return setting;
    }

    // New method to get actual value (decrypted if secret) for internal use
    async getValue<T>(key: string): Promise<T | null> {
        const setting = await this.prisma.setting.findUnique({ where: { key } });
        if (!setting) return null;

        let finalValue = setting.value;

        if (setting.type === 'secret') {
            try {
                finalValue = this.encryptionService.decrypt(finalValue);
            } catch (e) {
                console.error(`Failed to decrypt setting ${key}`, e);
                return null;
            }
        }

        return JSON.parse(finalValue) as T;
    }

    async update(key: string, value: any, user: { id: number; role: string }): Promise<Setting> {
        const existing = await this.prisma.setting.findUnique({ where: { key } });

        if (!existing) {
            throw new NotFoundException(`Setting with key ${key} not found`);
        }

        // Permission Check: Only ADMIN can edit system settings
        if (existing.isSystem && user.role !== 'ADMIN') {
            throw new ForbiddenException('Only administrators can modify system settings');
        }

        // If type is secret and value is mask, ignore
        if (existing.type === 'secret' && value === '********') {
            return existing;
        }

        let newValue = JSON.stringify(value);

        // Encrypt if secret using EncryptionService
        if (existing.type === 'secret') {
            newValue = this.encryptionService.encrypt(newValue);
        }

        // Don't update if value hasn't changed
        if (existing.value === newValue) {
            return existing;
        }

        // Create history record
        // Create history record
        await this.prisma.settingHistory.create({
            data: {
                settingId: existing.id,
                oldValue: existing.value, // Store encrypted history as is
                newValue,
                changedBy: user.id,
                version: existing.version + 1,
            },
        });

        // Update setting
        return this.prisma.setting.update({
            where: { key },
            data: {
                value: newValue,
                updatedBy: user.id,
            },
        });
    }

    async getHistory(key: string): Promise<SettingHistory[]> {
        const setting = await this.prisma.setting.findUnique({ where: { key } });
        if (!setting) throw new NotFoundException();

        const history = await this.prisma.settingHistory.findMany({
            where: { settingId: setting.id },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        if (setting.type === 'secret') {
            return history.map(h => ({ ...h, oldValue: '********', newValue: '********' }));
        }

        return history;
    }

    async seedSettings() {
        const defaults = [
            // General Settings
            {
                key: 'company.name',
                value: JSON.stringify('HiSecure Solutions'),
                type: 'string',
                category: 'General',
                description: 'Company Name',
                isPublic: true,
            },
            {
                key: 'system.maintenance',
                value: JSON.stringify(false),
                type: 'boolean',
                category: 'System',
                description: 'Maintenance Mode',
                isSystem: true,
            },
            {
                key: 'crm.lead_expiry',
                value: JSON.stringify(30),
                type: 'number',
                category: 'CRM',
                description: 'Days before leads expire',
            },
            {
                key: 'payment.stripe_key',
                value: this.encryptionService.encrypt(JSON.stringify('sk_test_123456')),
                type: 'secret',
                category: 'System',
                description: 'Stripe API Key',
                isSystem: true,
            },

            // Sales Settings (from script)
            {
                key: 'sales.requireSalesOrderForDC',
                value: JSON.stringify(false),
                type: 'boolean',
                category: 'Sales',
                description: 'Require Sales Order reference when creating Delivery Challan',
            },
            {
                key: 'sales.allowNegativeStockOnDC',
                value: JSON.stringify(false),
                type: 'boolean',
                category: 'Sales',
                description: 'Allow dispatching Delivery Challans even when stock is insufficient',
            },
            {
                key: 'sales.autoGenerateInvoiceFromDC',
                value: JSON.stringify(false),
                type: 'boolean',
                category: 'Sales',
                description: 'Automatically create Sales Invoice when DC is dispatched',
            },

            // Inventory Settings
            {
                key: 'inventory.enableSerialTracking',
                value: JSON.stringify(true),
                type: 'boolean',
                category: 'Inventory',
                description: 'Enable serial number tracking for products',
            },

            // Document Series - Delivery Challan
            {
                key: 'docSeries.deliveryChallan.prefix',
                value: JSON.stringify('DC-'),
                type: 'string',
                category: 'DocumentNumbering',
                description: 'Prefix for Delivery Challan numbers',
            },
            {
                key: 'docSeries.deliveryChallan.padding',
                value: JSON.stringify(4),
                type: 'number',
                category: 'DocumentNumbering',
                description: 'Number of digits in Delivery Challan sequence (e.g., 4 = 0001)',
            },

            // Document Series - Sales Invoice
            {
                key: 'docSeries.salesInvoice.prefix',
                value: JSON.stringify('INV-'),
                type: 'string',
                category: 'DocumentNumbering',
                description: 'Prefix for Sales Invoice numbers',
            },
            {
                key: 'docSeries.salesInvoice.padding',
                value: JSON.stringify(4),
                type: 'number',
                category: 'DocumentNumbering',
                description: 'Number of digits in Sales Invoice sequence',
            },

            // Document Series - Sales Order
            {
                key: 'docSeries.salesOrder.prefix',
                value: JSON.stringify('SO-'),
                type: 'string',
                category: 'DocumentNumbering',
                description: 'Prefix for Sales Order numbers',
            },
            {
                key: 'docSeries.salesOrder.padding',
                value: JSON.stringify(4),
                type: 'number',
                category: 'DocumentNumbering',
                description: 'Number of digits in Sales Order sequence',
            },

            // Document Series - Quotation
            {
                key: 'docSeries.salesQuotation.prefix',
                value: JSON.stringify('QT-'),
                type: 'string',
                category: 'DocumentNumbering',
                description: 'Prefix for Sales Quotation numbers',
            },
            {
                key: 'docSeries.salesQuotation.padding',
                value: JSON.stringify(4),
                type: 'number',
                category: 'DocumentNumbering',
                description: 'Number of digits in Sales Quotation sequence',
            },

            // Document Series - GRN
            {
                key: 'docSeries.grn.prefix',
                value: JSON.stringify('GRN-'),
                type: 'string',
                category: 'DocumentNumbering',
                description: 'Prefix for Goods Receipt Note numbers',
            },
            {
                key: 'docSeries.grn.padding',
                value: JSON.stringify(4),
                type: 'number',
                category: 'DocumentNumbering',
                description: 'Number of digits in GRN sequence',
            },
        ];

        for (const s of defaults) {
            const exists = await this.prisma.setting.findUnique({ where: { key: s.key } });
            if (!exists) {
                await this.prisma.setting.create({ data: s });
            }
        }
    }

    async exportSettings() {
        return this.prisma.setting.findMany({
            orderBy: { key: 'asc' }
        });
    }

    async importSettings(data: any[], user: { id: number }) {
        if (!Array.isArray(data)) {
            throw new Error('Invalid format: Expected an array of settings');
        }

        let count = 0;
        for (const item of data) {
            if (!item.key || item.value === undefined) continue;

            const existing = await this.prisma.setting.findUnique({ where: { key: item.key } });

            if (existing) {
                if (existing.value !== item.value) {
                    await this.prisma.setting.update({
                        where: { key: item.key },
                        data: {
                            value: item.value,
                            description: item.description,
                            category: item.category,
                            updatedBy: user.id
                        }
                    });
                    count++;
                }
            } else {
                await this.prisma.setting.create({
                    data: {
                        key: item.key,
                        value: item.value,
                        type: item.type || 'string',
                        category: item.category || 'General',
                        description: item.description,
                        isSystem: !!item.isSystem,
                        isPublic: !!item.isPublic,
                    }
                });
                count++;
            }
        }
        return { count, message: `Successfully processed ${count} settings` };
    }
}
