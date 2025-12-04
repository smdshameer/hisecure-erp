import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
    constructor(private readonly interactionsService: InteractionsService) { }

    @Post()
    create(@Request() req: any, @Body() createInteractionDto: CreateInteractionDto) {
        return this.interactionsService.create(req.user.userId, createInteractionDto);
    }

    @Get('customer/:customerId')
    findAllByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
        return this.interactionsService.findAllByCustomer(customerId);
    }
}
