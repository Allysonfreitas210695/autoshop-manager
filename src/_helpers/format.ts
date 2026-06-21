/**
 * Helpers de formatação centralizados.
 *
 * Datas: SEMPRE renderizadas no fuso horário do Brasil (America/Sao_Paulo).
 * O banco guarda em UTC; aqui convertemos para o horário brasileiro na exibição,
 * evitando o bug clássico de "um dia a menos" perto da meia-noite.
 */

export const BR_TIME_ZONE = "America/Sao_Paulo";

const dateInput = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

/** Valor monetário no formato brasileiro: R$ 1.234,56 */
export function formatCurrency(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Data curta no fuso do Brasil: 09/06/2026 */
export function formatDate(value: Date | string | number): string {
  return dateInput(value).toLocaleDateString("pt-BR", {
    timeZone: BR_TIME_ZONE,
  });
}

/** Data + hora no fuso do Brasil: 09/06/2026 14:30 */
export function formatDateTime(value: Date | string | number): string {
  return dateInput(value).toLocaleString("pt-BR", {
    timeZone: BR_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Apenas a hora no fuso do Brasil: 14:30 */
export function formatTime(value: Date | string | number): string {
  return dateInput(value).toLocaleTimeString("pt-BR", {
    timeZone: BR_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Data por extenso no fuso do Brasil: 9 de junho de 2026 */
export function formatLongDate(value: Date | string | number): string {
  return dateInput(value).toLocaleDateString("pt-BR", {
    timeZone: BR_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Máscara de placa brasileira.
 * Normaliza para maiúsculas, remove caracteres inválidos e limita a 7 posições.
 * Formato antigo (ABC-1234) ganha hífen; Mercosul (ABC1D23) fica sem hífen.
 */
export function formatPlate(raw: string): string {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);

  // 5º caractere numérico => formato antigo (ex: ABC1234) => insere hífen
  // Se for letra, é Mercosul (ex: ABC1D23) => não insere hífen
  if (clean.length > 4 && /\d/.test(clean[4])) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return clean;
}
