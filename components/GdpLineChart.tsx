import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearValue } from "@/lib/data";

type Props = {
  data: YearValue[];
};

export function GdpLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
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
          tickFormatter={(v) => `${v / 1_000_000_000}T`}
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
        <Line
          type="monotone"
          dataKey="value"
          stroke="#a855f7"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


