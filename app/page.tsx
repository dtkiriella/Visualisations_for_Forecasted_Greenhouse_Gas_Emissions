"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const TopPopulationPieChart = dynamic(() => import("@/components/TopPopulationPieChart"), { ssr: false });
const TopGdpDonutChart = dynamic(() => import("@/components/TopGdpDonutChart"), { ssr: false });
const TopEmittersBarChart = dynamic(() => import("@/components/TopEmittersBarChart"), { ssr: false });
const GdpVsPopulationScatter = dynamic(() => import("@/components/GdpVsPopulationScatter"), { ssr: false });
const CountryComparisonRadar = dynamic(() => import("@/components/CountryComparisonRadar"), { ssr: false });
const MultiCountryLineChart = dynamic(() => import("@/components/MultiCountryLineChart"), { ssr: false });
const FilteredGdpDonutChart = dynamic(() => import("@/components/FilteredGdpDonutChart"), { ssr: false });
const FilteredPopulationPieChart = dynamic(() => import("@/components/FilteredPopulationPieChart"), { ssr: false });
const FilteredEmittersBarChart = dynamic(() => import("@/components/FilteredEmittersBarChart"), { ssr: false });
const SectorEmissionsTopEmitters = dynamic(() => import("@/components/SectorEmissionsTopEmitters"), { ssr: false });
const GHGPredictions = dynamic(() => import("@/components/GHGPredictions"), { ssr: false });

type DatasetType = "gdp" | "population" | "emissions";

const tabs: { id: DatasetType; label: string; accent: string; icon: string }[] = [
  { id: "gdp", label: "GDP", accent: "from-fuchsia-500 to-indigo-400", icon: "💰" },
  {
    id: "population",
    label: "Population",
    accent: "from-cyan-400 to-emerald-400",
    icon: "👥",
  },
  { id: "emissions", label: "Emissions", accent: "from-pink-500 to-violet-500", icon: "🌍" },
];

export default function Home() {
  const [selected, setSelected] = useState<DatasetType>("gdp");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#050316] to-[#020617] text-slate-100">
      <header className="border-b border-slate-800/50 bg-[#050b1f]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6">
            {/* <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400/70">
              climate data hub
            </p> */}
            <h1 className="mt-2 text-4xl font-bold text-slate-50">
              Global Analytics Dashboard
            </h1>
            {/* <p className="mt-2 text-sm text-slate-400">
              Explore comprehensive visualizations across GDP, Population & Emissions datasets
            </p> */}
          </div>
          
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelected(tab.id)}
                className={`group flex flex-1 items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold transition-all ${
                  selected === tab.id
                    ? "bg-gradient-to-r " +
                      tab.accent +
                      " text-slate-50 shadow-[0_0_30px_rgba(129,140,248,0.6)] scale-105"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:scale-102"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {selected === "gdp" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">GDP Analytics</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Economic indicators and country comparisons
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Top Economic Powers
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TopGdpDonutChart />
                <GdpVsPopulationScatter />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Historical GDP Trends
              </h3>
              <MultiCountryLineChart type="gdp" />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Multi-Metric Country Analysis
              </h3>
              <CountryComparisonRadar />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Custom Country Filter - GDP
              </h3>
              <FilteredGdpDonutChart />
            </section>

          </div>
        )}

        {selected === "population" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Population Analytics</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Demographics and population distribution analysis
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Most Populous Nations
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TopPopulationPieChart />
                <GdpVsPopulationScatter />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Historical Population Growth
              </h3>
              <MultiCountryLineChart type="population" />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Multi-Metric Country Analysis
              </h3>
              <CountryComparisonRadar />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Custom Country Filter - Population
              </h3>
              <FilteredPopulationPieChart />
            </section>

          </div>
        )}

        {selected === "emissions" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Emissions Analytics</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Greenhouse gas emissions and climate impact analysis
                </p>
              </div>
            </div>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Largest Emitters by Country
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <TopEmittersBarChart />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Historical Emissions Trends
              </h3>
              <MultiCountryLineChart type="emissions" />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Multi-Metric Country Analysis
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CountryComparisonRadar />
                <GdpVsPopulationScatter />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Custom Country Filter - Emissions
              </h3>
              <FilteredEmittersBarChart />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Sector Emissions Predictions
              </h3>
              <SectorEmissionsTopEmitters />
            </section>

            <section>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Greenhouse Gas Predictions by Type
              </h3>
              <GHGPredictions />
            </section>
          </div>
        )}

        {/* <footer className="mt-16 rounded-3xl bg-slate-900/70 p-6 text-center">
          <p className="text-xs text-slate-400">
            All data loaded from <span className="font-semibold text-sky-400">dataset/</span> directory • 
            Charts update dynamically • Built with Next.js & Recharts
          </p>
          <div className="mt-3 flex justify-center gap-4 text-[10px] text-slate-500">
            <span>📊 6+ Chart Types</span>
            <span>•</span>
            <span>🌍 200+ Countries</span>
            <span>•</span>
            <span>📈 60+ Years of Data</span>
          </div>
        </footer> */}
      </main>
    </div>
  );
}

