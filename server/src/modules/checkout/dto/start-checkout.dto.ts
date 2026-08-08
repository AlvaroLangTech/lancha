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

  // SENIOR (2026-08-05): opcional de propósito - cupom inválido/de parceira
  // desativada NUNCA bloqueia a reserva, só não gera atribuição de venda
  // (ver CheckoutService.start). Cliente sem cupom continua reservando
  // normal.
  @IsOptional()
  @IsString()
  couponCode?: string;

  // SENIOR (2026-08-06, pedido do Alvaro: "a pessoa chegou, escolheu a
  // modelo... a comissão rola daí"): forma alternativa e mais simples de
  // atribuir a indicação - o cliente ESCOLHE o nome da parceira num seletor
  // no checkout (ver CheckoutModal.tsx), sem precisar saber cupom nenhum de
  // cor. Se os dois vierem preenchidos, partnerId tem prioridade (ver
  // CheckoutService.start) - o seletor é o caminho principal, o cupom
  // digitado é só o caminho alternativo pra quem só ouviu o código de boca.
  @IsOptional()
  @IsString()
  partnerId?: string;
}