import {
  Bar,
  BarChart,
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

export function EmissionsBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
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
          tickFormatter={(v) => `${v.toFixed(0)}`}
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
        <Bar
          dataKey="value"
          fill="#ec4899"
          radius={[6, 6, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}


