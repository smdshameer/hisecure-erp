import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/create-complaint.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('complaints')
@UseGuards(JwtAuthGuard)
export class ComplaintsController {
    constructor(private readonly complaintsService: ComplaintsService) { }

    @Post()
    create(@Body() createComplaintDto: CreateComplaintDto) {
        return this.complaintsService.create(createComplaintDto);
    }

    @Get()
    findAll() {
        return this.complaintsService.findAll();
    }

    @Get('customer/:customerId')
    findAllByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
        return this.complaintsService.findAllByCustomer(customerId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateComplaintDto: UpdateComplaintDto) {
        return this.complaintsService.update(id, updateComplaintDto);
    }
}
