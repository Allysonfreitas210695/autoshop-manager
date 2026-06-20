---
plan: 04-01
status: complete
---

## O que foi feito

- Instalou a dependência `qrcode.react` via npm
- Criou `src/app/(public)/track/[id]/_components/TrackQrCode.tsx` — componente client-side que encoda a URL pública de rastreamento em QR code real
- Integrou `TrackQrCode` na página `/track/[id]/page.tsx`, substituindo a simulação CSS grid por um QR code escaneável
- Requer `NEXT_PUBLIC_APP_URL` configurado no Vercel para que o QR code aponte para o domínio de produção

## Verificação

- QR code renderiza matriz real escaneável (não CSS simulado)
- `npx tsc --noEmit` — zero erros
- Commitado em main (obs. 1080, Jun 14 2026)
