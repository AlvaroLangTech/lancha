import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Público - o WhatsAppLeadForm do site chama isso direto, sem login.
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  // Protegido - só o painel gestor logado vê a lista de leads.
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'new' | 'contacted' | 'won' | 'lost') {
    return this.leadsService.updateStatus(id, status);
  }
}
