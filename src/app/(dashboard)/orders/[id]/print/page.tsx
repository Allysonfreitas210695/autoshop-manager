import { notFound } from "next/navigation";

import { getMockOrderById } from "@/_lib/mock-data";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Props = { params: Promise<{ id: string }> };

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const order = getMockOrderById(id);
  if (!order) notFound();

  const parts = order.items.filter((i) => i.type === "part");
  const labor = order.items.filter((i) => i.type === "labor");
  const subtotalParts = parts.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotalLabor = labor.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotalParts + subtotalLabor;

  const pixKey = "12.345.678/0001-99";
  const pixAmount = total;

  return (
    <>
      {/* Botão de impressão — oculto ao imprimir */}
      <div className="border-outline-variant bg-surface flex justify-end gap-2 border-b px-6 py-3 print:hidden">
        <a
          href={`/orders/${order.id}/budget`}
          className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest rounded-md border px-4 py-2 font-mono"
        >
          Ver Orçamento
        </a>
        <button
          onClick={() => window.print()}
          className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 rounded-md px-4 py-2 font-mono font-bold"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Layout de impressão */}
      <div className="mx-auto max-w-2xl space-y-6 bg-white p-8 text-gray-900 print:p-6">
        {/* Cabeçalho da oficina */}
        <div className="flex items-start justify-between border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">PRECISION AUTO</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Oficina Mecânica Especializada
            </p>
            <p className="text-xs text-gray-400">
              CNPJ: 12.345.678/0001-99 · Rua das Oficinas, 500 — SP
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs tracking-wider text-gray-400 uppercase">
              Ordem de Serviço
            </p>
            <p className="text-2xl font-bold text-gray-800">{order.id}</p>
            <p className="font-mono text-xs text-gray-500">
              Entrada: {new Date(order.entryDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Cliente + Veículo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Cliente
            </p>
            <p className="font-semibold text-gray-800">{order.customer}</p>
            <p className="font-mono text-xs text-gray-500">
              {order.customerCpf}
            </p>
            <p className="font-mono text-xs text-gray-500">
              {order.customerPhone}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Veículo
            </p>
            <p className="font-semibold text-gray-800">{order.vehicle}</p>
            <p className="font-mono text-xs text-gray-500">
              {order.vehicleYear} · {order.vehicleColor}
            </p>
            <p className="font-mono text-xs font-bold text-gray-700">
              {order.plate} · {order.mileage.toLocaleString("pt-BR")} km
            </p>
          </div>
        </div>

        {/* Tipo e Mecânico */}
        <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-3 text-sm">
          <div>
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Tipo
            </p>
            <p className="font-medium text-gray-700">{order.serviceType}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Prioridade
            </p>
            <p className="font-medium text-gray-700">{order.priority}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Mecânico
            </p>
            <p className="font-medium text-gray-700">{order.mechanic}</p>
          </div>
        </div>

        {/* Relato + Diagnóstico */}
        <div className="space-y-3">
          <div>
            <p className="mb-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Relato do Cliente
            </p>
            <p className="text-sm text-gray-700">{order.clientReport}</p>
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Diagnóstico Técnico
            </p>
            <p className="text-sm text-gray-700">{order.diagnosis}</p>
          </div>
        </div>

        {/* Peças */}
        {parts.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Peças Utilizadas
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-2 py-1.5 text-left font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                    Item
                  </th>
                  <th className="px-2 py-1.5 text-center font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                    Qtd
                  </th>
                  <th className="px-2 py-1.5 text-right font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                    Unit.
                  </th>
                  <th className="px-2 py-1.5 text-right font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parts.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-1.5 text-gray-700">
                      {item.description}
                    </td>
                    <td className="px-2 py-1.5 text-center font-mono text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-gray-600">
                      {brl(item.unitPrice)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold text-gray-800">
                      {brl(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mão de obra */}
        {labor.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Mão de Obra
            </p>
            <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
              {labor.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <p className="text-sm text-gray-700">{item.description}</p>
                  <p className="font-mono text-sm font-bold text-gray-800">
                    {brl(item.unitPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totais */}
        <div className="space-y-1 border-t border-gray-300 pt-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal peças</span>
            <span className="font-mono">{brl(subtotalParts)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Mão de obra</span>
            <span className="font-mono">{brl(subtotalLabor)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold text-gray-900">
            <span>TOTAL</span>
            <span className="font-mono">{brl(total)}</span>
          </div>
        </div>

        {/* QR Code PIX */}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            {/* QR Code placeholder */}
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white">
              <div className="grid grid-cols-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-3.5 rounded-sm ${
                      [0, 1, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15].includes(i)
                        ? "bg-gray-800"
                        : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
                Pagamento via PIX
              </p>
              <p className="mt-1 font-mono text-xs break-all text-gray-600">
                Chave: {pixKey}
              </p>
              <p className="font-mono text-sm font-bold text-gray-800">
                {brl(pixAmount)}
              </p>
              <p className="mt-1 font-mono text-[10px] text-gray-400">
                Escaneie o QR Code com o app do seu banco
              </p>
            </div>
          </div>
        </div>

        {/* Notas */}
        {order.notes && (
          <div className="rounded-md border border-gray-200 p-3">
            <p className="mb-1 font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Observações Técnicas
            </p>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Assinatura */}
        <div className="grid grid-cols-2 gap-8 border-t border-gray-200 pt-6">
          <div className="space-y-1 text-center">
            <div className="h-12 border-b border-gray-300" />
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Assinatura do Cliente
            </p>
            <p className="font-mono text-xs text-gray-500">{order.customer}</p>
          </div>
          <div className="space-y-1 text-center">
            <div className="h-12 border-b border-gray-300" />
            <p className="font-mono text-[10px] tracking-wider text-gray-400 uppercase">
              Responsável Técnico
            </p>
            <p className="font-mono text-xs text-gray-500">{order.mechanic}</p>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center font-mono text-[10px] text-gray-400">
          Precision Auto · precisionauto.com.br · (11) 3000-0000 · Emitido em{" "}
          {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </>
  );
}
