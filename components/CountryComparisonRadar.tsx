"use client";

import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

type RadarData = {
  metric: string;
  [key: string]: string | number;
};

const COUNTRIES = ["USA", "CHN", "IND", "DEU", "JPN"];
const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];

export default function CountryComparisonRadar() {
  const [data, setData] = useState<RadarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/data/radar?countries=${COUNTRIES.join(",")}`);
        const json = await res.json();
        setData(json.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl bg-slate-900/70 p-6">
        <p className="text-xs text-slate-400">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-900/70 p-6">
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Multi-Metric Country Comparison
        </h3>
        <p className="mt-1 text-[10px] text-slate-500">
          Normalized scores (0-100) across GDP, Population, Emissions
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
          {COUNTRIES.map((country, idx) => (
            <Radar
              key={country}
              name={country}
              dataKey={country}
              stroke={COLORS[idx]}
              fill={COLORS[idx]}
              fillOpacity={0.2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: 12,
              border: "1px solid #1f2937",
              fontSize: 11,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

