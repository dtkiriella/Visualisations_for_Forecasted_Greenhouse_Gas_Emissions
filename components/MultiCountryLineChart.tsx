"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TimeSeriesData = {
  year: string;
  [key: string]: string | number;
};

const COUNTRIES = ["USA", "CHN", "IND", "DEU", "JPN"];
const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];

type Props = {
  type: "gdp" | "population" | "emissions";
};

export default function MultiCountryLineChart({ type }: Props) {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const endpoint = type === "emissions" 
          ? `/api/data/compare-emissions?countries=${COUNTRIES.join(",")}`
          : `/api/data/compare?type=${type}&countries=${COUNTRIES.join(",")}`;
        const res = await fetch(endpoint);
        const json = await res.json();
        setData(json.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl bg-slate-900/70 p-6">
        <p className="text-xs text-slate-400">Loading chart...</p>
      </div>
    );
  }

  const getFormatter = () => {
    if (type === "gdp") return (v: number | undefined) => {
      if (v === undefined || v === null) return "—";
      return `$${(v / 1_000_000_000_000).toFixed(1)}T`;
    };
    if (type === "population") return (v: number | undefined) => {
      if (v === undefined || v === null) return "—";
      return `${(v / 1_000_000_000).toFixed(2)}B`;
    };
    return (v: number | undefined) => {
      if (v === undefined || v === null) return "—";
      return `${v.toFixed(2)} MtCO₂e`;
    };
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 p-6">
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {type === "gdp" && "GDP Comparison - Top 5 Countries"}
          {type === "population" && "Population Comparison - Top 5 Countries"}
          {type === "emissions" && "Emissions Comparison - Top 5 Countries"}
        </h3>
        <p className="mt-1 text-[10px] text-slate-500">Historical trends</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickMargin={8}
            minTickGap={20}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v) => getFormatter()(v)}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: 12,
              border: "1px solid #1f2937",
              fontSize: 11,
            }}
            formatter={(rawValue) => {
              const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
              return getFormatter()(value);
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {COUNTRIES.map((country, idx) => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={COLORS[idx]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

