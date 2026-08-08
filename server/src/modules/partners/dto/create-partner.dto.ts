import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  // SENIOR: só letras/números/hífen - evita cupom com espaço ou caractere
  // que quebre a URL de indicação (?cupom=...).
  @IsString()
  @Matches(/^[A-Za-z0-9-]{3,20}$/, {
    message: 'Cupom deve ter de 3 a 20 caracteres, só letras, números e hífen.',
  })
  couponCode: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
