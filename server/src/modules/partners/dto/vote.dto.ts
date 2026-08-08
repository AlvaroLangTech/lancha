import { IsString, MinLength } from 'class-validator';

// SENIOR: visitorId vem do localStorage do navegador (gerado uma vez, ver
// PartnersRankingBoard.tsx) - não é autenticação, só identifica "o mesmo
// navegador votou de novo" pra travar 1 voto/mês. O servidor combina isso
// com o IP da requisição pra formar o fingerprint final (ver
// partners.service.ts vote()), então o valor sozinho não é suficiente pra
// nada sensível.
export class VoteDto {
  @IsString()
  @MinLength(8)
  visitorId: string;
}
