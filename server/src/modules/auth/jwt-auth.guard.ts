import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Uso: @UseGuards(JwtAuthGuard) em qualquer rota do painel admin
// (bookings/leads de gestão), igual o padrão FirebaseAuthGuard do Viver Bem.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
