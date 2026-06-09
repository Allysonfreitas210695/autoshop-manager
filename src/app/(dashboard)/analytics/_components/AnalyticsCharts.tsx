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
  MechanicPerformance,
  MonthlyRevenue,
  ServiceCategory,
} from "@/_lib/queries/analytics";

function shortBrl(v: number) {
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const COLORS = [
  "#adc6ff",
  "#ffb690",
  "#22C55E",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
];

export function RevenueLineChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={shortBrl}
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-container)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{
            color: "var(--color-on-surface)",
            fontFamily: "monospace",
          }}
          formatter={(value, name) => [
            shortBrl(Number(value)),
            name === "revenue"
              ? "Receita"
              : name === "expenses"
                ? "Despesas"
                : "Lucro",
          ]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#adc6ff"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ffb690"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#22C55E"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MechanicBarChart({ data }: { data: MechanicPerformance[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={shortBrl}
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{
            fill: "var(--color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-container)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [shortBrl(Number(value)), "Receita"]}
        />
        <Bar dataKey="revenue" fill="#adc6ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServicePieChart({ data }: { data: ServiceCategory[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={48}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-container)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name) => [shortBrl(Number(value)), String(name)]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
