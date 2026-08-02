import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

// Público de propósito - mesmo padrão do CheckoutController: é o assistente
// que o visitante do site usa sem estar logado.
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // SENIOR (2026-08-02): limite mais apertado que o default global (300/min
  // em app.module.ts) - essa rota chama uma API de IA paga por token, então
  // um limite mais rígido por IP (20/min) evita custo/abuso sem incomodar
  // uso normal (ninguém manda 20 mensagens de chat por minuto de verdade).
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('message')
  message(@Body() dto: SendMessageDto) {
    return this.chatService.reply(dto.message, dto.history);
  }
}
