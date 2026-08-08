import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR (2026-08-05, pedido do Alvaro: "sistema de indicação com ranking
// profissional, com cupom... objetivo delas se tornarem vendedoras e
// receberem comissão"): cada parceira (ex-role de conteúdo que quis ir além)
// tem um cupom próprio. Reserva paga com esse cupom = venda atribuída a ela
// (ver Booking.partnerId). Isso é o que soma pro ranking mensal, junto com
// voto público (ver PartnerVote) - a fórmula de combinação vive em
// partners.service.ts (getMonthlyRanking).
@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  // SENIOR: cupom sempre em maiúsculas pra comparação case-insensitive ficar
  // simples (ver partners.service.ts findByCouponCode) - sem depender de
  // collation especial do banco.
  @Column({ unique: true })
  couponCode: string;

  // SENIOR: permite tirar uma parceira do programa (ex: rodízio, saiu do
  // grupo) sem apagar o histórico de vendas/votos dela - importante pro
  // painel gestor continuar mostrando o mês que ela participou.
  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
