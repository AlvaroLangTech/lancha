import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// SENIOR (2026-08-01): login simples do painel gestor da Lancha - email +
// senha com hash bcrypt, sem depender de nenhum provedor externo (Firebase
// etc.) pra manter o v1 o mais simples possivel, como o Alvaro pediu. Dá pra
// evoluir pra Firebase/OAuth depois sem quebrar nada, essa tabela so guarda
// credencial + role.
@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'admin' })
  role: 'admin';

  @Column({ nullable: true })
  displayName?: string;

  @CreateDateColumn()
  createdAt: Date;
}
