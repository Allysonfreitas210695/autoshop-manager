"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { OrderStatus } from "@/_schemas/service-order";

const STATUS_COLOR: Record<OrderStatus, string> = {
  in_progress: "var(--status-progress)",
  completed: "var(--status-completed)",
  delayed: "var(--status-delayed)",
  pending: "var(--status-pending)",
};

type Datum = { status: OrderStatus; label: string; value: number };

export function StatusChart({ data }: { data: Datum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell key={item.status} fill={STATUS_COLOR[item.status]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-headline-md text-on-surface font-bold">
            {total}
          </span>
          <span className="text-label-sm text-on-surface-variant/60 font-mono">
            ORDENS
          </span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.status} className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[item.status] }}
            />
            <span className="text-label-md text-on-surface-variant font-mono">
              {item.label} ({item.value})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
