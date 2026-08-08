import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR (2026-08-05): voto público, sem cadastro (pedido do Alvaro: "quem
// acessar o site pode votar"). Anti-fraude leve: 1 voto por visitante por
// mês, não por parceira - visitorFingerprint é um hash de (visitorId salvo
// no localStorage do navegador + IP), gerado em partners.service.ts. Isso
// NÃO impede alguém de limpar cookies/usar aba anônima pra votar de novo -
// é o nível "sem fricção" que o Alvaro pediu. Se a fraude virar problema de
// verdade, o próximo passo é exigir confirmação por WhatsApp (mais fricção,
// mais seguro) - decisão em aberto, ver conversa 2026-08-05.
@Entity('partner_votes')
@Index(['month', 'visitorFingerprint'], { unique: true })
export class PartnerVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  partnerId: string;

  // Formato "YYYY-MM" - chave natural do reset mensal do ranking.
  @Column()
  month: string;

  @Column()
  visitorFingerprint: string;

  @CreateDateColumn()
  createdAt: Date;
}
