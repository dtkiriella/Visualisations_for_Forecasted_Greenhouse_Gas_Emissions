"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CountryData = {
  country: string;
  value: number;
};

const YEARS_EMISSIONS = Array.from({ length: 41 }, (_, i) => String(1990 + i)).reverse(); // 1990-2030

export default function TopEmittersBarChart() {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [yearSearch, setYearSearch] = useState<string>("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const year = selectedYear || "2020";
        const res = await fetch(`/api/data/combined-emissions?year=${year}`);
        const json = await res.json();
        const topTen = (json.data ?? [])
          .sort((a: CountryData, b: CountryData) => b.value - a.value)
          .slice(0, 10);
        setData(topTen);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedYear]);

  const filteredYears = YEARS_EMISSIONS.filter(year => 
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
            Top 10 Emitters (MtCO₂e)
          </h3>
          <p className="mt-1 text-[10px] text-slate-500">
            {selectedYear ? `Year: ${selectedYear} • ` : ""}Latest available year - All GHG
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
                className="w-full rounded-t-lg border-b border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                {filteredYears.map((year) => (
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
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            tickFormatter={(v) => `${v.toFixed(0)}`}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            width={80}
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
              if (value === 0 && rawValue !== 0) return "—";
              return `${value.toFixed(2)} MtCO₂e`;
            }}
          />
          <Bar dataKey="value" fill="#ec4899" radius={[0, 8, 8, 0]} />
        </BarChart>
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

