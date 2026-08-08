import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR (2026-08-05, pedido do Alvaro: "registrar pagamento no painel"):
// cada linha é UM pagamento feito a uma parceira - nunca sobrescreve, só
// soma. "Comissão devida" = computeLifetimeCommissionCents(total dela) -
// soma de PartnerPayout.amountCents dela (ver PartnersService
// getAllFinancials). Histórico completo fica auditável, dá pra ver quando
// e quanto foi pago em cada data.
@Entity('partner_payouts')
export class PartnerPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  partnerId: string;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}
