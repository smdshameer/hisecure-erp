import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DeliveryChallanService } from './delivery-challan.service';
import { CreateDeliveryChallanDto } from './dto/create-delivery-challan.dto';
import { UpdateDeliveryChallanDto } from './dto/update-delivery-challan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('delivery-challans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryChallanController {
    constructor(private readonly dcService: DeliveryChallanService) { }

    @Post()
    create(@Body() createDto: CreateDeliveryChallanDto, @Req() req) {
        return this.dcService.create(createDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.dcService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.dcService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateDeliveryChallanDto) {
        return this.dcService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.dcService.remove(+id);
    }
}
