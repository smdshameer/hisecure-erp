import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FollowUpsService } from './followups.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/create-followup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('followups')
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
    constructor(private readonly followUpsService: FollowUpsService) { }

    @Post()
    create(@Body() createFollowUpDto: CreateFollowUpDto) {
        return this.followUpsService.create(createFollowUpDto);
    }

    @Get('pending')
    findAllPending() {
        return this.followUpsService.findAllPending();
    }

    @Get('customer/:customerId')
    findAllByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
        return this.followUpsService.findAllByCustomer(customerId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateFollowUpDto: UpdateFollowUpDto) {
        return this.followUpsService.update(id, updateFollowUpDto);
    }
}
