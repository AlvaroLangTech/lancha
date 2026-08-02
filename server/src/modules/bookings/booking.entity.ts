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

  @Column({ type: 'int', default: 125000 })
  depositAmountCents: number; // 50% de R$ 2.500 = R$ 1.250,00 (boatPackage.price / 2), em centavos

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
