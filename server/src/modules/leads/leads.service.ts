import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(@InjectRepository(Lead) private readonly leads: Repository<Lead>) {}

  create(dto: CreateLeadDto) {
    // SENIOR (2026-08-01): source agora vem do dto (ex: "whatsapp-bot" pro
    // bot da Lancha), caindo em "site" so quando nao informado - antes o
    // hardcode aqui sobrescrevia qualquer origem diferente.
    const lead = this.leads.create({ ...dto, source: dto.source || 'site' });
    return this.leads.save(lead);
  }

  findAll() {
    return this.leads.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: Lead['status']) {
    await this.leads.update(id, { status });
    return this.leads.findOne({ where: { id } });
  }
}
