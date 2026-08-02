import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendCodeDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}
