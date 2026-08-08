import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type BookingStatus = 'pending_verification' | 'awaiting_payment' | 'confirmed' | 'canceled';

// SENIOR (2026-08-01, "finalizarmos a compra toda pelo site... checkout
// para o banco asaas"): uma reserva nasce "pending_verification" (email
// ainda não confirmado), vira "awaiting_payment" depois que o email é
// confirmado (libera a cobrança Asaas do sinal de 50%), e "confirmed" só
// quando o webhook do Asaas avisa que o pagamento caiu - nunca o frontend
// sozinho marca como confirmada (mesma regra do Viver Bem: quem confirma
// pagamento é o gateway, via webhook, não o cliente clicando em algo).
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerCpf?: string;

  @Column({ type: 'date' })
  requestedDate: string;

  @Column({ nullable: true })
  occasion?: string;

  @Column({ type: 'int', default: 1 })
  passengerCount: number;

  @Column({ nullable: true })
  holdExpiresAt?: Date;

  // SENIOR (2026-08-03, correcao urgente do Alvaro: "nao existe esse negocio
  // de 50%, e de uma vez so" - ate aqui o sistema cobrava so metade do valor
  // (sinal), com o resto acertado depois com o piloto. Alvaro confirmou que
  // isso esta ERRADO: o pagamento e sempre integral, de uma vez, no
  // checkout. Renomeado o CONCEITO pra "valor cobrado no checkout" (mantendo
  // o nome da coluna pra nao precisar de migração de banco), e o valor agora
  // e o preco cheio. checkout.service.ts passa esse valor explicitamente na
  // criacao da reserva, entao nao depende mais do default da coluna no
  // Postgres (que so se aplicaria numa coluna omitida no INSERT).
  @Column({ type: 'int', default: 200000 })
  depositAmountCents: number; // valor cobrado no checkout = preco integral promocional (R$ 2.000,00), em centavos

  @Column({ default: 'pending_verification' })
  status: BookingStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  asaasCustomerId?: string;

  @Column({ nullable: true })
  asaasPaymentId?: string;

  @Column({ nullable: true })
  paymentInvoiceUrl?: string;

  // SENIOR (2026-08-02, pedido do Alvaro: "no painel gestor, quem tiver o
  // perfil, vai ver quem aceitou os termos"): antes NADA registrava aceite
  // de termos - o checkout coletava dados e pagamento sem nenhuma evidencia
  // de consentimento (LGPD, ver secao 15/16 do Plano Mestre). Guarda a
  // versao do texto aceito + timestamp, nunca so um boolean solto - se o
  // termo mudar de versao no futuro, da pra saber exatamente o que cada
  // cliente aceitou.
  @Column({ nullable: true })
  termsAcceptedVersion?: string;

  @Column({ nullable: true })
  termsAcceptedAt?: Date;

  // SENIOR (2026-08-05, pedido do Alvaro: "sistema de indicação com cupom...
  // objetivo delas se tornarem vendedoras e receberem comissão"): quando o
  // cliente digita um cupom válido no checkout, guarda o ID da parceira aqui
  // - é isso que partners.service.ts soma pro ranking/comissão quando a
  // reserva vira "confirmed". couponCodeUsed guarda o texto cru digitado
  // (mesmo se o cupom for inválido/de parceira desativada), só pra
  // auditoria - nunca é a fonte de verdade da comissão, só partnerId é.
  @Column({ nullable: true })
  partnerId?: string;

  @Column({ nullable: true })
  couponCodeUsed?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
