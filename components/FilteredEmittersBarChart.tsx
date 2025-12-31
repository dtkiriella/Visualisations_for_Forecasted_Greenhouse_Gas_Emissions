"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type YearData = {
  year: string;
  [key: string]: string | number;
};

type CountryMeta = {
  code: string;
  name: string;
};

const COLORS = [
  "#ff0080", "#ff0040", "#00f5ff", "#ffff00", "#ff6b00",
  "#0080ff", "#ff8800", "#9d00ff", "#00ff88", "#00ffc8"
];

export default function FilteredEmittersBarChart() {
  const [data, setData] = useState<YearData[]>([]);
  const [countries, setCountries] = useState<CountryMeta[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [countrySearch, setCountrySearch] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch("/api/data?list=countries");
        const json = await res.json();
        setCountries(json.countries ?? []);
        if (json.countries && json.countries.length > 0) {
          setSelectedCountries(["CHN", "USA", "IND", "RUS", "JPN"].filter(code => 
            json.countries.some((c: CountryMeta) => c.code === code)
          ));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (selectedCountries.length === 0) {
        setData([]);
        return;
      }

      setLoadingData(true);
      try {
        const res = await fetch(`/api/data/compare-emissions?countries=${selectedCountries.join(",")}`);
        const json = await res.json();
        setData(json.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [selectedCountries]);

  const handleCountryToggle = (code: string) => {
    setSelectedCountries(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const filteredCountries = countries.filter(country =>
    countrySearch === "" || 
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
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
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Emissions by Year - Selected Countries (MtCO₂e)
        </h3>
        <p className="mt-1 text-[10px] text-slate-500">
          Historical emissions data filtered by country - All GHG
        </p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Filter by Countries:
          </label>
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            {selectedCountries.length > 0 
              ? `${selectedCountries.length} selected` 
              : "Select countries"} {showCountryDropdown ? "▲" : "▼"}
          </button>
          {showCountryDropdown && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full rounded-t-lg border-b border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <label
                    key={country.code}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-slate-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.code)}
                      onChange={() => handleCountryToggle(country.code)}
                      className="h-3 w-3 rounded border-slate-600 bg-slate-700 text-pink-500 focus:ring-2 focus:ring-pink-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-slate-300">{country.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        {selectedCountries.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCountries.map((code) => {
              const country = countries.find(c => c.code === code);
              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2 py-1 text-xs text-pink-300"
                >
                  {country?.name || code}
                  <button
                    onClick={() => handleCountryToggle(code)}
                    className="hover:text-pink-100"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {loadingData ? (
        <div className="flex h-full min-h-[300px] items-center justify-center">
          <p className="text-xs text-slate-400">Loading data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-full min-h-[300px] items-center justify-center">
          <p className="text-xs text-slate-400">No data available. Please select countries.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickMargin={8}
              minTickGap={20}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(v) => `${v.toFixed(0)}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderRadius: 12,
                border: "1px solid #1f2937",
                fontSize: 11,
              }}
              formatter={(rawValue: any) => {
                const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
                if (value === 0 && rawValue !== 0) return "—";
                return `${value.toFixed(2)} MtCO₂e`;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {selectedCountries.map((code, idx) => {
              const countryName = countries.find(c => c.code === code)?.name ?? code;
              return (
                <Bar
                  key={code}
                  dataKey={code}
                  name={countryName}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
      {showCountryDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  );
}
