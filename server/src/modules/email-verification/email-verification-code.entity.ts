import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR: codigo de 6 digitos com validade curta (10min) e limite de
// tentativas - guardado no banco (nao em memoria) pra sobreviver a restart
// do processo, mesmo padrao de "nada de confiar em estado volátil pra algo
// que trava um pagamento" usado no resto do sistema.
@Entity('email_verification_codes')
export class EmailVerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  bookingId?: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
