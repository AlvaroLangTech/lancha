import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR: CRM simples de leads - captura todo mundo que preencheu o
// WhatsAppLeadForm no site (mesmo quem não fechou reserva/checkout), pra
// aparecer no painel gestor e o Alvaro poder trabalhar cada contato.
@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  occasion?: string;

  @Column({ nullable: true, type: 'date' })
  desiredDate?: string;

  // SENIOR (2026-08-01): captura crua da mensagem quando o lead vem do bot
  // de WhatsApp (não dá pra confiar em parsing automático de nome/data a
  // partir de texto livre - melhor guardar tudo e o time lê no painel).
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: 'site' })
  source: string;

  @Column({ default: 'new' })
  status: 'new' | 'contacted' | 'won' | 'lost';

  @CreateDateColumn()
  createdAt: Date;
}
