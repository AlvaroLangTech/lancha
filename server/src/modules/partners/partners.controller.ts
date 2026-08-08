import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { VoteDto } from './dto/vote.dto';
import { RegisterPayoutDto } from './dto/register-payout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// SENIOR (2026-08-05): mesmo padrão do LeadsController - um controller só,
// misturando rotas públicas (site, sem login) e rotas protegidas (painel
// gestor, @UseGuards(JwtAuthGuard) por rota, não na classe inteira).
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // Público - lista de parceiras ativas pro board de votação no site.
  // Só campos de exibição (nome, instagram, foto) - nunca cupom nem dado
  // de contato aqui.
  @Get()
  findAllPublic() {
    return this.partnersService.findAllPublic();
  }

  // Público - ranking do mês pro board de gamificação. Esconde
  // salesCount/salesRevenueCents/comissão de propósito (dado financeiro, não
  // é pra aparecer pra visitante nem pra outras parceiras verem quanto a
  // colega ganhou) - só rank, nome, voto e o NÍVEL (badge tipo "Capitã")
  // ficam visíveis. Nível é status público de propósito - é o que deixa o
  // board "viciante" (pedido do Alvaro), sem vazar R$.
  @Get('ranking')
  async publicRanking(@Query('month') month?: string) {
    const ranking = await this.partnersService.getMonthlyRanking(month);
    return ranking.map(
      ({ partnerId, name, instagram, photoUrl, voteCount, rank, levelNumber, levelName, bookingsUntilNextLevel }) => ({
        partnerId,
        name,
        instagram,
        photoUrl,
        voteCount,
        rank,
        levelNumber,
        levelName,
        bookingsUntilNextLevel,
      }),
    );
  }

  // Público - votar numa parceira. 1 voto por visitante (fingerprint) por
  // mês, ver PartnersService.vote().
  @Post(':id/vote')
  vote(@Param('id') id: string, @Body() dto: VoteDto, @Req() req: Request) {
    return this.partnersService.vote(id, dto.visitorId, req.ip ?? 'unknown');
  }

  // Protegido - painel gestor: lista completa (inclui inativas e cupom).
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.partnersService.findAllAdmin();
  }

  // Protegido - ranking completo com vendas/receita, pro relatório do
  // painel gestor (era o que faltava - "até hoje não vi o painel gestor
  // pra pegar relatórios").
  @UseGuards(JwtAuthGuard)
  @Get('admin/ranking')
  adminRanking(@Query('month') month?: string) {
    return this.partnersService.getMonthlyRanking(month);
  }

  // Protegido - cadastrar parceira nova com o cupom dela.
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  // Protegido - editar/desativar parceira.
  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePartnerDto>) {
    return this.partnersService.update(id, dto);
  }

  // Protegido - relatório financeiro completo: nível, comissão acumulada na
  // carreira, quanto já foi pago e quanto ainda deve, por parceira. É o
  // "cadê a comissão das modelos" (pedido do Alvaro, 2026-08-05).
  @UseGuards(JwtAuthGuard)
  @Get('admin/financials')
  financials() {
    return this.partnersService.getAllFinancials();
  }

  // Protegido - registra que um pagamento de comissão foi feito. Nunca
  // apaga/edita reserva nem recalcula histórico - só soma no total pago
  // (ver PartnersService.registerPayout).
  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/payouts')
  registerPayout(@Param('id') id: string, @Body() dto: RegisterPayoutDto) {
    return this.partnersService.registerPayout(id, dto.amountCents, dto.note);
  }

  // Protegido - lista todos os votos (parceira + data) pra Alvaro auditar e
  // apagar voto de teste/suspeito (pedido: "controle de todos os votos").
  @UseGuards(JwtAuthGuard)
  @Get('admin/votes')
  adminVotes(@Query('month') month?: string) {
    return this.partnersService.getAllVotesAdmin(month);
  }

  // Protegido - apaga um voto específico (ex: voto de teste do próprio
  // Alvaro). Recalcula o ranking automaticamente na próxima consulta, não
  // precisa de nenhum passo extra.
  @UseGuards(JwtAuthGuard)
  @Delete('admin/votes/:id')
  deleteVote(@Param('id') id: string) {
    return this.partnersService.deleteVote(id);
  }
}
