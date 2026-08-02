import { IsIn, IsString, Length } from 'class-validator';

export class PayDto {
  @IsIn(['PIX', 'CREDIT_CARD', 'BOLETO'])
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';

  @IsString()
  @Length(11, 14)
  cpfCnpj: string;
}
