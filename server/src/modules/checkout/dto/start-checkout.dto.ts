import { Equals, IsDateString, IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

// SENIOR (2026-08-02): termsAccepted é OBRIGATÓRIO e tem que vir true -
// @Equals(true) rejeita a reserva se o cliente não marcou o checkbox (não dá
// pra confiar só no frontend desabilitar o botão). termsVersion identifica
// QUAL texto de termos foi aceito, pra auditoria se o texto mudar depois.
export class StartCheckoutDto {
  @IsString()
  @MinLength(2)
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @MinLength(8)
  customerPhone: string;

  @IsDateString()
  requestedDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  passengerCount: number;

  @IsOptional()
  @IsString()
  occasion?: string;

  @Equals(true, { message: 'É necessário aceitar os termos de reserva.' })
  termsAccepted: boolean;

  @IsString()
  @MinLength(1)
  termsVersion: string;
}