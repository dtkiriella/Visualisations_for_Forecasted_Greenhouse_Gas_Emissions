import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearValue } from "@/lib/data";

type Props = {
  data: YearValue[];
};

export function PopulationAreaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="populationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="#1f2937"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="year"
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          tickMargin={8}
          minTickGap={12}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          tickFormatter={(v) => `${v / 1_000_000_000}B`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 12,
            border: "1px solid #1f2937",
            fontSize: 11,
          }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#populationGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


