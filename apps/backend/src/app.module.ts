import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { ServiceTicketsModule } from './service-tickets/service-tickets.module';
import { CustomersModule } from './customers/customers.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { PdfModule } from './pdf/pdf.module';
import { StorageModule } from './storage/storage.module';
import { ReportsModule } from './reports/reports.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { WarrantyModule } from './warranty/warranty.module';
import { AccountingModule } from './accounting/accounting.module';

import { ScheduleModule } from '@nestjs/schedule';
import { AutomationModule } from './automation/automation.module';
import { BranchesModule } from './branches/branches.module';
import { TransfersModule } from './transfers/transfers.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { InteractionsController } from './crm/interactions.controller';
import { InteractionsService } from './crm/interactions.service';
import { FollowUpsController } from './crm/followups.controller';
import { FollowUpsService } from './crm/followups.service';
import { ComplaintsController } from './crm/complaints.controller';
import { ComplaintsService } from './crm/complaints.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AutomationModule,
    UsersModule,
    AuthModule,
    PrismaModule,
    ProductsModule,
    SalesModule,
    ServiceTicketsModule,
    CustomersModule,
    EnquiriesModule,
    PdfModule,
    StorageModule,
    ReportsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    WarrantyModule,
    AccountingModule,
    BranchesModule,
    TransfersModule,
    AnalyticsModule,
  ],
  controllers: [
    AppController,
    InteractionsController,
    FollowUpsController,
    ComplaintsController,
  ],
  providers: [
    AppService,
    InteractionsService,
    FollowUpsService,
    ComplaintsService,
  ],
})
export class AppModule { }
