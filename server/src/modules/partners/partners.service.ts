import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import { Partner } from './partner.entity';
import { PartnerVote } from './partner-vote.entity';
import { PartnerPayout } from './partner-payout.entity';
import { Booking } from '../bookings/booking.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import {
  computeLifetimeCommissionCents,
  getBookingsUntilNextLevel,
  getLevelForCount,
} from './levels';

// SENIOR (2026-08-05, pedido do Alvaro: "ranking profissional... combinar
// venda real com voto do pÃºblico"): pesos do ranking mensal. Venda pesa mais
// porque Ã© o que gera dinheiro de verdade (e Ã© o que define quem vira
// vendedora fixa, ver conversa sobre threshold de 30/60 locaÃ§Ãµes); voto Ã©
// engajamento/gamificaÃ§Ã£o, nÃ£o decide sozinho. AjustÃ¡vel aqui, um lugar sÃ³,
// se o Alvaro quiser outra proporÃ§Ã£o.
const SALES_WEIGHT = 0.7;
const VOTE_WEIGHT = 0.3;
const FATHERS_DAY_PUBLIC_PARTNERS = new Set(['nalanda', 'bessa', 'kanandra']);

export interface RankingEntry {
  partnerId: string;
  name: string;
  instagram?: string;
  photoUrl?: string;
  voteCount: number;
  salesCount: number;
  salesRevenueCents: number;
  score: number;
  rank: number;
  levelNumber: number;
  levelName: string;
  bookingsUntilNextLevel: number | null;
}

export interface PartnerFinancials {
  partnerId: string;
  name: string;
  couponCode: string;
  active: boolean;
  levelNumber: number;
  levelName: string;
  bookingsUntilNextLevel: number | null;
  lifetimeConfirmedBookings: number;
  lifetimeCommissionCents: number;
  totalPaidCents: number;
  owedCents: number;
}

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner) private readonly partners: Repository<Partner>,
    @InjectRepository(PartnerVote) private readonly votes: Repository<PartnerVote>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(PartnerPayout) private readonly payouts: Repository<PartnerPayout>,
  ) {}

  static currentMonth(): string {
    return new Date().toISOString().slice(0, 7); // "YYYY-MM"
  }

  create(dto: CreatePartnerDto) {
    const partner = this.partners.create({ ...dto, couponCode: dto.couponCode.toUpperCase() });
    return this.partners.save(partner);
  }

  findAllAdmin() {
    return this.partners.find({ order: { createdAt: 'DESC' } });
  }

  async findAllPublic() {
    const partners = await this.partners.find({
      where: { active: true },
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'instagram', 'photoUrl', 'couponCode'],
    });
    return partners.filter((partner) => FATHERS_DAY_PUBLIC_PARTNERS.has(partner.name.trim().toLowerCase()));
  }

  // SENIOR (2026-08-06): usado pelo checkout quando o cliente ESCOLHE a
  // parceira num seletor (por id, ver GET /partners) em vez de digitar
  // cupom - mesma regra do findByCouponCode: sÃ³ parceira ATIVA gera
  // atribuiÃ§Ã£o.
  findActiveById(id: string) {
    return this.partners.findOne({ where: { id, active: true } });
  }

  async update(id: string, dto: Partial<CreatePartnerDto>) {
    const data = { ...dto };
    if (data.couponCode) data.couponCode = data.couponCode.toUpperCase();
    await this.partners.update(id, data);
    const partner = await this.partners.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Parceira nÃ£o encontrada.');
    return partner;
  }

  // SENIOR: usado pelo checkout pra resolver o campo livre "cupom" que o
  // cliente digita no site - case-insensitive de propÃ³sito (nÃ£o dÃ¡ pra
  // confiar que todo mundo vai digitar igual foi cadastrado), sÃ³ cupom ATIVO
  // conta (parceira que saiu do programa nÃ£o gera comissÃ£o pra ninguÃ©m mais
  // usando o cÃ³digo antigo dela).
  findByCouponCode(code: string) {
    return this.partners.findOne({ where: { couponCode: code.toUpperCase(), active: true } });
  }

  // SENIOR: fingerprint = hash(visitorId do localStorage + IP), nunca guarda
  // o IP cru na tabela de votos - suficiente pra travar "1 voto/mÃªs" sem
  // reter dado pessoal identificÃ¡vel direto no banco.
  private buildFingerprint(visitorId: string, ip: string): string {
    return createHash('sha256').update(`${visitorId}:${ip}`).digest('hex');
  }

  async vote(partnerId: string, visitorId: string, ip: string) {
    const partner = await this.partners.findOne({ where: { id: partnerId, active: true } });
    if (!partner) throw new NotFoundException('Parceira nÃ£o encontrada ou inativa.');

    const month = PartnersService.currentMonth();
    const visitorFingerprint = this.buildFingerprint(visitorId, ip);

    const existing = await this.votes.findOne({ where: { month, visitorFingerprint } });
    if (existing) {
      throw new ConflictException('VocÃª jÃ¡ votou este mÃªs. Volta mÃªs que vem para votar de novo!');
    }

    const vote = this.votes.create({ partnerId, month, visitorFingerprint });
    await this.votes.save(vote);
    return { success: true };
  }

  // SENIOR (2026-08-06, pedido do Alvaro: "preciso ter o controle de todos os
  // votos... tirar o meu voto"): lista de votos pro painel gestor auditar e
  // apagar (ex: voto de teste do prÃ³prio Alvaro). NÃ£o devolve o
  // visitorFingerprint bruto pro front - Ã© hash mas ainda assim nÃ£o precisa
  // trafegar, sÃ³ o necessÃ¡rio pra identificar/apagar a linha.
  async getAllVotesAdmin(month?: string) {
    const votes = await this.votes.find({
      where: month ? { month } : {},
      order: { createdAt: 'DESC' },
    });
    const partnerIds = [...new Set(votes.map((v) => v.partnerId))];
    const partners = partnerIds.length ? await this.partners.find({ where: { id: In(partnerIds) } }) : [];
    const nameById = new Map(partners.map((p) => [p.id, p.name]));

    return votes.map((v) => ({
      id: v.id,
      partnerId: v.partnerId,
      partnerName: nameById.get(v.partnerId) ?? '(parceira removida)',
      month: v.month,
      createdAt: v.createdAt,
    }));
  }

  async deleteVote(id: string) {
    const result = await this.votes.delete(id);
    if (!result.affected) throw new NotFoundException('Voto nÃ£o encontrado.');
    return { success: true };
  }

  // SENIOR: nÃºcleo do ranking - combina venda real (reserva CONFIRMADA,
  // atribuÃ­da via cupom, dentro do mÃªs) com voto pÃºblico do mesmo mÃªs.
  // Normaliza cada mÃ©trica pelo maior valor do grupo daquele mÃªs (0 a 1)
  // antes de aplicar o peso, senÃ£o uma mÃ©trica com nÃºmeros muito maiores
  // (ex: 50 votos vs 3 vendas) dominaria o score sozinha.
  async getMonthlyRanking(month: string = PartnersService.currentMonth()): Promise<RankingEntry[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(year, monthNum - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthNum, 1));

    const partners = await this.partners.find({ order: { createdAt: 'ASC' } });
    if (partners.length === 0) return [];

    const confirmedBookings = await this.bookings.find({
      where: { status: 'confirmed', createdAt: Between(monthStart, monthEnd) },
    });
    const monthVotes = await this.votes.find({ where: { month } });

    // SENIOR: nÃ­vel Ã© LIFETIME (ver levels.ts), entÃ£o conta TODAS as
    // reservas confirmadas dela, nÃ£o sÃ³ as do mÃªs - por isso essa query Ã©
    // separada da de confirmedBookings acima (que Ã© sÃ³ pro score mensal).
    const lifetimeCounts = await this.getLifetimeConfirmedCounts();

    const salesByPartner = new Map<string, { count: number; revenueCents: number }>();
    for (const booking of confirmedBookings) {
      if (!booking.partnerId) continue;
      const current = salesByPartner.get(booking.partnerId) ?? { count: 0, revenueCents: 0 };
      current.count += 1;
      current.revenueCents += booking.depositAmountCents;
      salesByPartner.set(booking.partnerId, current);
    }

    const votesByPartner = new Map<string, number>();
    for (const vote of monthVotes) {
      votesByPartner.set(vote.partnerId, (votesByPartner.get(vote.partnerId) ?? 0) + 1);
    }

    const maxSales = Math.max(1, ...partners.map((p) => salesByPartner.get(p.id)?.count ?? 0));
    const maxVotes = Math.max(1, ...partners.map((p) => votesByPartner.get(p.id) ?? 0));

    const entries = partners.map((partner) => {
      const sales = salesByPartner.get(partner.id) ?? { count: 0, revenueCents: 0 };
      const voteCount = votesByPartner.get(partner.id) ?? 0;
      const salesScore = sales.count / maxSales;
      const voteScore = voteCount / maxVotes;
      const score = SALES_WEIGHT * salesScore + VOTE_WEIGHT * voteScore;
      const lifetimeCount = lifetimeCounts.get(partner.id) ?? 0;
      const level = getLevelForCount(lifetimeCount);

      return {
        partnerId: partner.id,
        name: partner.name,
        instagram: partner.instagram,
        photoUrl: partner.photoUrl,
        voteCount,
        salesCount: sales.count,
        salesRevenueCents: sales.revenueCents,
        score,
        rank: 0,
        levelNumber: level.level,
        levelName: level.name,
        // SENIOR (2026-08-06, pedido do Alvaro: "eu tenho que saber os
        // proximos niveis"): quantas reservas CONFIRMADAS faltam pra prÃ³ximo
        // nÃ­vel - exposto publicamente de propÃ³sito (Ã© o que deixa o board
        // "viciante"/tipo bbb), sem revelar R$ nenhum, sÃ³ a contagem.
        bookingsUntilNextLevel: getBookingsUntilNextLevel(lifetimeCount),
      };
    });

    entries.sort((a, b) => b.score - a.score || b.salesCount - a.salesCount || b.voteCount - a.voteCount);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  // SENIOR: total de reservas CONFIRMADAS de cada parceira, sem limite de
  // mÃªs - Ã© o nÃºmero que define o nÃ­vel dela (ver levels.ts) e a comissÃ£o
  // acumulada. Usa query agrupada no banco em vez de carregar toda reserva
  // confirmada na memÃ³ria, pra nÃ£o ficar pesado conforme o histÃ³rico cresce.
  private async getLifetimeConfirmedCounts(): Promise<Map<string, number>> {
    const rows = await this.bookings
      .createQueryBuilder('booking')
      .select('booking.partnerId', 'partnerId')
      .addSelect('COUNT(*)', 'count')
      .where('booking.status = :confirmed', { confirmed: 'confirmed' })
      .andWhere('booking.partnerId IS NOT NULL')
      .groupBy('booking.partnerId')
      .getRawMany<{ partnerId: string; count: string }>();

    return new Map(rows.map((row) => [row.partnerId, Number(row.count)]));
  }

  // SENIOR (2026-08-05, pedido do Alvaro: "registrar pagamento no painel"):
  // relatÃ³rio completo pro painel gestor - por parceira, quanto ela jÃ¡
  // gerou de comissÃ£o na carreira toda, quanto jÃ¡ foi pago (soma de
  // PartnerPayout) e quanto ainda deve. Base de tudo que o botÃ£o "Registrar
  // pagamento" do admin usa.
  async getAllFinancials(): Promise<PartnerFinancials[]> {
    const partners = await this.partners.find({ order: { createdAt: 'ASC' } });
    const lifetimeCounts = await this.getLifetimeConfirmedCounts();

    const paidRows = await this.payouts
      .createQueryBuilder('payout')
      .select('payout.partnerId', 'partnerId')
      .addSelect('SUM(payout.amountCents)', 'total')
      .groupBy('payout.partnerId')
      .getRawMany<{ partnerId: string; total: string }>();
    const paidByPartner = new Map(paidRows.map((row) => [row.partnerId, Number(row.total)]));

    return partners.map((partner) => {
      const lifetimeConfirmedBookings = lifetimeCounts.get(partner.id) ?? 0;
      const level = getLevelForCount(lifetimeConfirmedBookings);
      const lifetimeCommissionCents = computeLifetimeCommissionCents(lifetimeConfirmedBookings);
      const totalPaidCents = paidByPartner.get(partner.id) ?? 0;

      return {
        partnerId: partner.id,
        name: partner.name,
        couponCode: partner.couponCode,
        active: partner.active,
        levelNumber: level.level,
        levelName: level.name,
        bookingsUntilNextLevel: getBookingsUntilNextLevel(lifetimeConfirmedBookings),
        lifetimeConfirmedBookings,
        lifetimeCommissionCents,
        totalPaidCents,
        owedCents: lifetimeCommissionCents - totalPaidCents,
      };
    });
  }

  async registerPayout(partnerId: string, amountCents: number, note?: string) {
    const partner = await this.partners.findOne({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Parceira nÃ£o encontrada.');

    const payout = this.payouts.create({ partnerId, amountCents, note });
    await this.payouts.save(payout);
    return { success: true };
  }
}

