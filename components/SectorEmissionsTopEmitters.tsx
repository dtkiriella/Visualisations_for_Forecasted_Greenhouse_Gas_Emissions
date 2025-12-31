"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type SectorEmissionData = {
  ISO: string;
  Country: string;
  Sector: string;
  Year: number;
  Predicted_Emissions: number;
};

const SECTORS = [
  "Energy",
  "Industrial Processes",
  "Agriculture",
  "Waste",
  "Land-Use Change and Forestry",
];

const SECTOR_COLORS: Record<string, string> = {
  "Energy": "#ef4444",
  "Industrial Processes": "#f59e0b",
  "Agriculture": "#10b981",
  "Waste": "#06b6d4",
  "Land-Use Change and Forestry": "#8b5cf6",
};

export default function SectorEmissionsTopEmitters() {
  const [data, setData] = useState<SectorEmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("China");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/data/sector-emissions-predictions");
        const json = await response.json();
        setData(json.data || []);
      } catch (e) {
        console.error("Error loading sector emissions data:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(data.map((d) => d.Country))).sort();
    return uniqueCountries;
  }, [data]);

  const years = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.Year))).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesCountry = selectedCountry === "all" || item.Country === selectedCountry;
      const matchesSector = selectedSector === "all" || item.Sector === selectedSector;
      const matchesYear = selectedYear === "all" || item.Year.toString() === selectedYear;
      const matchesSearch = searchTerm === "" || 
        item.Country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ISO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Sector.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCountry && matchesSector && matchesYear && matchesSearch;
    });
  }, [data, selectedCountry, selectedSector, selectedYear, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, selectedSector, selectedYear, searchTerm]);

  const chartData = useMemo(() => {
    if (selectedCountry === "all") return [];
    
    const countryData = data.filter((d) => d.Country === selectedCountry);
    const yearGroups = years.map((year) => {
      const yearData: any = { year: year.toString() };
      SECTORS.forEach((sector) => {
        const sectorData = countryData.find((d) => d.Year === year && d.Sector === sector);
        yearData[sector] = sectorData?.Predicted_Emissions || 0;
      });
      return yearData;
    });
    return yearGroups;
  }, [data, selectedCountry, years]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-3xl bg-slate-900/70 p-6">
        <p className="text-xs text-slate-400">Loading sector emissions data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-900/70 p-6">
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Sector Emissions Predictions (2021-2030)
        </h3>
        <p className="mt-1 text-[10px] text-slate-500">
          Emissions by sector: Energy, Industrial Processes, Agriculture, Waste, and Land-Use Change
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-slate-800/50 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-300">Emission Sectors:</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SECTORS.map((sector) => (
            <div key={sector} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded flex-shrink-0"
                style={{ backgroundColor: SECTOR_COLORS[sector] }}
              />
              <span className="text-xs text-slate-300">{sector}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-300">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-300">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-300">Sector</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sectors</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-300">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCountry !== "all" && (
        <div className="mb-6 rounded-lg bg-slate-800/30 p-4">
          <h4 className="mb-4 text-sm font-semibold text-slate-200">
            {selectedCountry} - Emissions by Sector
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                {SECTORS.map((sector) => (
                  <linearGradient key={sector} id={`gradient-${sector.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SECTOR_COLORS[sector]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={SECTOR_COLORS[sector]} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  fontSize: 10,
                }}
                formatter={(value: any) => `${Number(value).toFixed(2)} MtCO₂e`}
              />
              <Legend 
                wrapperStyle={{ fontSize: "11px" }}
                iconType="rect"
              />
              {SECTORS.map((sector) => (
                <Area
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stackId="1"
                  stroke={SECTOR_COLORS[sector]}
                  fill={`url(#gradient-${sector.replace(/\s+/g, '-')})`}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg bg-slate-800/30">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-700 bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-300">ISO</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Country</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Sector</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Year</th>
              <th className="px-4 py-3 font-semibold text-slate-300">Emissions (MtCO₂e)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">{item.ISO}</td>
                  <td className="px-4 py-3 text-slate-200">{item.Country}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${SECTOR_COLORS[item.Sector] || "#64748b"}20`,
                        color: SECTOR_COLORS[item.Sector] || "#64748b",
                      }}
                    >
                      {item.Sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.Year}</td>
                  <td className="px-4 py-3 text-slate-200">{item.Predicted_Emissions.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {filteredData.length > 0 && (
          <div className="border-t border-slate-700 bg-slate-800/30 px-4 py-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-xs text-slate-400">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded bg-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded px-2 py-1 text-xs ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded bg-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
