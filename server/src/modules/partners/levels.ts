// SENIOR (2026-08-05, pedido do Alvaro: "a cada reserva de início é 100
// reais... como é gamificação, vamos construir níveis, o site tem que ser
// viciante"): progressão de NÍVEL é por total de reservas CONFIRMADAS na
// vida toda da parceira (lifetime, nunca reseta) - diferente do ranking do
// mês (esse sim reseta, ver PartnersService.getMonthlyRanking). É a
// diferença entre "seu troféu do mês" (ranking) e "sua carreira" (nível):
// perder o nível ao virar o mês seria desmotivador, então nível só sobe.
//
// A comissão de cada reserva usa a taxa do nível EM QUE ELA ESTAVA quando
// aquela reserva foi a N-ésima confirmada (ver commissionForPosition) - não
// recalcula reservas antigas quando ela sobe de nível. Isso é o padrão
// normal de programa de indicação em níveis: subir de nível vale mais daqui
// pra frente, não reescreve o passado.
export interface CommissionLevel {
  level: number;
  name: string;
  minBookings: number;
  rateCents: number;
}

export const COMMISSION_LEVELS: CommissionLevel[] = [
  { level: 1, name: 'Tripulante', minBookings: 0, rateCents: 10000 }, // R$100
  { level: 2, name: 'Marinheira', minBookings: 3, rateCents: 12000 }, // R$120
  { level: 3, name: 'Timoneira', minBookings: 6, rateCents: 15000 }, // R$150
  { level: 4, name: 'Capitã', minBookings: 12, rateCents: 20000 }, // R$200
];

// Nível atual dado o total de reservas confirmadas até agora.
export function getLevelForCount(totalConfirmedBookings: number): CommissionLevel {
  let current = COMMISSION_LEVELS[0];
  for (const tier of COMMISSION_LEVELS) {
    if (totalConfirmedBookings >= tier.minBookings) current = tier;
  }
  return current;
}

// Quantas reservas faltam pro próximo nível (null se já está no topo).
export function getBookingsUntilNextLevel(totalConfirmedBookings: number): number | null {
  const currentLevel = getLevelForCount(totalConfirmedBookings);
  const next = COMMISSION_LEVELS.find((tier) => tier.level === currentLevel.level + 1);
  if (!next) return null;
  return Math.max(0, next.minBookings - totalConfirmedBookings);
}

// Taxa que vale pra reserva na posição N (1-based) da sequência de reservas
// confirmadas da parceira - determina o nível dela NAQUELE momento.
function commissionRateForPosition(position: number): number {
  return getLevelForCount(position - 1).rateCents;
}

// Soma a comissão de todas as reservas confirmadas dela, aplicando a taxa
// do nível vigente em cada uma (ver comentário do topo do arquivo).
export function computeLifetimeCommissionCents(totalConfirmedBookings: number): number {
  let total = 0;
  for (let position = 1; position <= totalConfirmedBookings; position += 1) {
    total += commissionRateForPosition(position);
  }
  return total;
}
