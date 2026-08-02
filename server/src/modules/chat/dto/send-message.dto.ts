import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HistoryItemDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(500)
  text: string;
}

// SENIOR (2026-08-02): limites curtos de propósito - isso chama uma API de
// IA paga por token, então mensagem gigante ou histórico gigante = custo e
// risco de abuso. 500 char cobre qualquer pergunta real de cliente; 12
// mensagens de histórico é contexto suficiente pra conversa curta de chat de
// vendas sem deixar o prompt (e o custo) crescer sem limite.
export class SendMessageDto {
  @IsString()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => HistoryItemDto)
  history?: HistoryItemDto[];
}
