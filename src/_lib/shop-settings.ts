/**
 * Configurações da oficina (dados institucionais usados em impressão,
 * página pública de acompanhamento e rodapés). Lidas de variáveis de
 * ambiente com fallback para valores padrão, evitando hardcode espalhado
 * pela UI. Em produção, defina as `NEXT_PUBLIC_SHOP_*` no ambiente.
 */
export type ShopSettings = {
  name: string;
  cnpj: string;
  pixKey: string;
  address: string;
  phone: string;
  hours: string;
  url: string;
};

export function getShopSettings(): ShopSettings {
  const env = process.env;
  return {
    name: env.NEXT_PUBLIC_SHOP_NAME ?? "Precision Auto",
    cnpj: env.NEXT_PUBLIC_SHOP_CNPJ ?? "12.345.678/0001-99",
    pixKey: env.NEXT_PUBLIC_SHOP_PIX_KEY ?? "12.345.678/0001-99",
    address:
      env.NEXT_PUBLIC_SHOP_ADDRESS ?? "Av. das Oficinas, 1000 — São Paulo, SP",
    phone: env.NEXT_PUBLIC_SHOP_PHONE ?? "(11) 3456-7890",
    hours: env.NEXT_PUBLIC_SHOP_HOURS ?? "Seg–Sex 8h–18h",
    url:
      env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined" ? window.location.origin : ""),
  };
}
