"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

type ScatterData = {
  country: string;
  population: number;
  gdp: number;
  gdpPerCapita: number;
};

const YEARS = Array.from({ length: 65 }, (_, i) => String(1960 + i)).reverse();

export default function GdpVsPopulationScatter() {
  const [data, setData] = useState<ScatterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [yearSearch, setYearSearch] = useState<string>("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = selectedYear 
          ? `/api/data/scatter?year=${selectedYear}`
          : "/api/data/scatter";
        const res = await fetch(url);
        const json = await res.json();
        setData(json.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedYear]);

  const filteredYears = YEARS.filter(year => 
    yearSearch === "" || year.includes(yearSearch)
  );

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl bg-slate-900/70 p-6">
        <p className="text-xs text-slate-400">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-900/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            GDP vs Population Scatter
          </h3>
          <p className="mt-1 text-[10px] text-slate-500">
            Bubble size = GDP per capita {selectedYear ? `(${selectedYear})` : "(latest year)"}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            {selectedYear || "Filter by Year"} {showYearDropdown ? "▲" : "▼"}
          </button>
          {showYearDropdown && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
              <input
                type="text"
                placeholder="Search year..."
                value={yearSearch}
                onChange={(e) => setYearSearch(e.target.value)}
                className="w-full rounded-t-lg border-b border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedYear("");
                    setShowYearDropdown(false);
                    setYearSearch("");
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50"
                >
                  Latest Year
                </button>
                {filteredYears.slice(0, 20).map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                      setYearSearch("");
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="population"
            name="Population"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
            label={{ value: "Population", position: "bottom", fill: "#9ca3af", fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="gdp"
            name="GDP"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v) => `$${(v / 1_000_000_000_000).toFixed(1)}T`}
            label={{ value: "GDP", angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="gdpPerCapita" range={[20, 400]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: 12,
              border: "1px solid #1f2937",
              fontSize: 11,
            }}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(rawValue, name) => {
              const value =
                typeof rawValue === "number"
                  ? rawValue
                  : Number(
                      Array.isArray(rawValue) ? rawValue[0] ?? 0 : rawValue ?? 0,
                    );

              if (name === "Population") return value.toLocaleString();
              if (name === "GDP")
                return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
              if (name === "GDP per capita")
                return `$${value.toLocaleString()}`;

              return value.toLocaleString();
            }}
          />
          <Scatter name="Countries" data={data} fill="#8b5cf6" />
        </ScatterChart>
      </ResponsiveContainer>
      {showYearDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowYearDropdown(false)}
        />
      )}
    </div>
  );
}

