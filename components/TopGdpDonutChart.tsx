"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CountryData = {
  country: string;
  value: number;
};

const COLORS = [
  "#a855f7", "#ec4899", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1"
];

const YEARS = Array.from({ length: 65 }, (_, i) => String(1960 + i)).reverse();

export default function TopGdpDonutChart() {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [yearSearch, setYearSearch] = useState<string>("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = selectedYear 
          ? `/api/data/top?type=gdp&limit=10&year=${selectedYear}`
          : "/api/data/top?type=gdp&limit=10";
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

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-3xl bg-slate-900/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Top 10 Countries by GDP
          </h3>
          <p className="mt-1 text-[10px] text-slate-500">
            {selectedYear ? `Year: ${selectedYear} • ` : ""}Total: ${(total / 1_000_000_000_000).toFixed(2)}T
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
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0];
                  const countryName = entry.payload?.country || "Unknown";
                  const value = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
                  const formattedValue = value > 0 ? `$${(value / 1_000_000_000_000).toFixed(2)}T` : "—";
                  
                  return (
                    <div
                      style={{
                        backgroundColor: "#1e293b",
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        padding: "12px",
                        color: "#e2e8f0",
                        fontSize: "11px",
                      }}
                    >
                      <p style={{ marginBottom: "4px", fontWeight: "500", color: "#e2e8f0" }}>
                        {countryName}
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1" }}>
                        GDP: {formattedValue}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid w-full grid-cols-2 gap-2 text-xs lg:w-auto">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="h-3 w-3 min-w-[12px] rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-300 truncate">{item.country}</span>
            </div>
          ))}
        </div>
      </div>
      {showYearDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowYearDropdown(false)}
        />
      )}
    </div>
  );
}

