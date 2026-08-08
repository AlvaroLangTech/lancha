import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPayoutDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountCents: number;

  @IsOptional()
  @IsString()
  note?: string;
}
