import { AlertTriangle, TrendingDown } from "lucide-react";

type Props = { stock: number; minStock: number };

export function StockBadge({ stock, minStock }: Props) {
  const isCritical = stock < minStock;
  const isLow = stock === minStock;

  if (isCritical) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <AlertTriangle className="text-error size-3.5 shrink-0" />
        <span className="text-label-sm text-error font-mono font-bold">
          {stock}
        </span>
        <span className="text-on-surface-variant/60 font-mono text-[10px]">
          mín {minStock}
        </span>
      </div>
    );
  }

  if (isLow) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <TrendingDown className="text-warning size-3.5 shrink-0" />
        <span className="text-label-sm text-warning font-mono font-bold">
          {stock}
        </span>
        <span className="text-on-surface-variant/60 font-mono text-[10px]">
          mín {minStock}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-label-sm text-on-surface font-mono font-bold">
        {stock}
      </span>
      <span className="text-on-surface-variant/60 font-mono text-[10px]">
        mín {minStock}
      </span>
    </div>
  );
}
