"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  CostBreakdownEntry,
  MonthlyCashFlow,
  WeeklyCashFlow,
} from "@/_data-access/finance";
import { formatCurrency } from "@/_helpers/format";

function shortBrl(v: number) {
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
  return formatCurrency(v);
}

export function CashFlowBarChart({ data }: { data: WeeklyCashFlow[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="week"
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={shortBrl}
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-container)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "var(--color-on-surface)",
          }}
          formatter={(value) => [
            typeof value === "number" ? formatCurrency(value) : value,
          ]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar
          dataKey="receitas"
          name="Receitas"
          fill="#adc6ff"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="despesas"
          name="Despesas"
          fill="#ffb690"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: MonthlyCashFlow[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={shortBrl}
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-container)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "var(--color-on-surface)",
          }}
          formatter={(value) => [
            typeof value === "number" ? formatCurrency(value) : value,
          ]}
          cursor={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Line
          type="monotone"
          dataKey="receitas"
          name="Receitas"
          stroke="#adc6ff"
          strokeWidth={2}
          dot={{ r: 3, fill: "#adc6ff" }}
        />
        <Line
          type="monotone"
          dataKey="despesas"
          name="Despesas"
          stroke="#ffb690"
          strokeWidth={2}
          dot={{ r: 3, fill: "#ffb690" }}
        />
        <Line
          type="monotone"
          dataKey="lucro"
          name="Lucro"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: "#22c55e" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CostDonutChart({ data }: { data: CostBreakdownEntry[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={46}
            outerRadius={72}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: entry.fill }}
            />
            <span className="text-body-sm text-on-surface-variant">
              {entry.name}
            </span>
            <span className="text-label-sm text-on-surface ml-auto font-mono font-bold">
              {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
