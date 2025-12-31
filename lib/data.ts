import fs from "fs/promises";
import path from "path";

export type YearValue = {
  year: string;
  value: number;
};

export type CountryMeta = {
  code: string;
  name: string;
};

const DATASET_DIR = path.join(process.cwd(), "dataset");

const YEARS_GDP_POPULATION: string[] = [
  ...Array.from({ length: 65 }, (_, i) => String(1960 + i)),
];

const YEARS_EMISSIONS: string[] = [
  ...Array.from({ length: 31 }, (_, i) => String(1990 + i)),
];

async function readCsv(fileName: string): Promise<string[]> {
  const filePath = path.join(DATASET_DIR, fileName);
  const content = await fs.readFile(filePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function safeNumber(value: string): number {
  if (!value) return 0;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function getCountries(): Promise<CountryMeta[]> {
  const lines = await readCsv("country_gdp_filtered.csv");
  const countries: Record<string, string> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const name = cols[0];
    const code = cols[1];

    if (!code || !name) continue;
    countries[code] = name;
  }

  return Object.entries(countries)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGlobalGdp(): Promise<YearValue[]> {
  const lines = await readCsv("country_gdp_filtered.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_GDP_POPULATION.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const totals: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    for (const [year, idx] of Object.entries(yearIndices)) {
      const v = safeNumber(cols[idx] ?? "");
      if (!totals[year]) totals[year] = 0;
      totals[year] += v;
    }
  }

  return Object.keys(totals)
    .sort()
    .map((year) => ({
      year,
      value: Number(totals[year].toFixed(2)),
    }));
}

export async function getCountryGdp(code: string): Promise<YearValue[]> {
  const lines = await readCsv("country_gdp_filtered.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_GDP_POPULATION.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const row = lines
    .slice(1)
    .map((line) => parseCsvRow(line))
    .find((cols) => cols[1] === code);

  if (!row) return [];

  return Object.entries(yearIndices)
    .map(([year, idx]) => ({
      year,
      value: safeNumber(row[idx] ?? ""),
    }))
    .filter((d) => d.value !== 0);
}

export async function getGlobalPopulation(): Promise<YearValue[]> {
  const lines = await readCsv("country_population_filtered.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_GDP_POPULATION.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const totals: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    for (const [year, idx] of Object.entries(yearIndices)) {
      const v = safeNumber(cols[idx] ?? "");
      if (!totals[year]) totals[year] = 0;
      totals[year] += v;
    }
  }

  return Object.keys(totals)
    .sort()
    .map((year) => ({
      year,
      value: Number(totals[year].toFixed(0)),
    }));
}

export async function getCountryPopulation(code: string): Promise<YearValue[]> {
  const lines = await readCsv("country_population_filtered.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_GDP_POPULATION.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const row = lines
    .slice(1)
    .map((line) => parseCsvRow(line))
    .find((cols) => cols[1] === code);

  if (!row) return [];

  return Object.entries(yearIndices)
    .map(([year, idx]) => ({
      year,
      value: safeNumber(row[idx] ?? ""),
    }))
    .filter((d) => d.value !== 0);
}

export async function getGlobalEmissions(): Promise<YearValue[]> {
  const lines = await readCsv("historical_emissions.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_EMISSIONS.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const totals: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const sector = cols[3];
    const gas = cols[4];

    if (sector !== "Total excluding LUCF" || gas !== "All GHG") continue;

    for (const [year, idx] of Object.entries(yearIndices)) {
      const v = safeNumber(cols[idx] ?? "");
      if (!totals[year]) totals[year] = 0;
      totals[year] += v;
    }
  }

  return Object.keys(totals)
    .sort()
    .map((year) => ({
      year,
      value: Number(totals[year].toFixed(2)),
    }));
}

export async function getCountryEmissions(
  code: string,
): Promise<YearValue[]> {
  const lines = await readCsv("historical_emissions.csv");
  const header = parseCsvRow(lines[0]);

  const yearIndices = YEARS_EMISSIONS.reduce<Record<string, number>>(
    (acc, year) => {
      const index = header.indexOf(year);
      if (index !== -1) acc[year] = index;
      return acc;
    },
    {},
  );

  const totals: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const iso = cols[0];
    const sector = cols[3];
    const gas = cols[4];

    if (iso !== code) continue;
    if (sector !== "Total excluding LUCF" || gas !== "All GHG") continue;

    for (const [year, idx] of Object.entries(yearIndices)) {
      const v = safeNumber(cols[idx] ?? "");
      if (!totals[year]) totals[year] = 0;
      totals[year] += v;
    }
  }

  return Object.keys(totals)
    .sort()
    .map((year) => ({
      year,
      value: Number(totals[year].toFixed(2)),
    }));
}

export async function getTopCountriesByMetric(
  type: "gdp" | "population" | "emissions",
  limit: number = 10,
  year?: string,
): Promise<{ country: string; value: number }[]> {
  const countries = await getCountries();
  const results: { country: string; value: number }[] = [];

  for (const c of countries) {
    let series: YearValue[] = [];
    if (type === "gdp") series = await getCountryGdp(c.code);
    else if (type === "population") series = await getCountryPopulation(c.code);
    else if (type === "emissions") series = await getCountryEmissions(c.code);

    let dataPoint: YearValue | undefined;
    if (year) {
      dataPoint = series.find(d => d.year === year);
    } else {
      dataPoint = series[series.length - 1];
    }

    if (dataPoint && dataPoint.value > 0) {
      results.push({ country: c.name, value: dataPoint.value });
    }
  }

  return results.sort((a, b) => b.value - a.value).slice(0, limit);
}

export async function getScatterData(year?: string): Promise<
  { country: string; population: number; gdp: number; gdpPerCapita: number }[]
> {
  const countries = await getCountries();
  const results: { country: string; population: number; gdp: number; gdpPerCapita: number }[] = [];

  for (const c of countries) {
    const gdpSeries = await getCountryGdp(c.code);
    const popSeries = await getCountryPopulation(c.code);

    let gdpData: YearValue | undefined;
    let popData: YearValue | undefined;

    if (year) {
      gdpData = gdpSeries.find(d => d.year === year);
      popData = popSeries.find(d => d.year === year);
    } else {
      gdpData = gdpSeries[gdpSeries.length - 1];
      popData = popSeries[popSeries.length - 1];
    }

    if (gdpData && popData && gdpData.value > 0 && popData.value > 0) {
      results.push({
        country: c.name,
        population: popData.value,
        gdp: gdpData.value,
        gdpPerCapita: gdpData.value / popData.value,
      });
    }
  }

  return results.filter(r => r.population > 1_000_000);
}

export async function getRadarData(
  codes: string[],
): Promise<{ metric: string; [key: string]: string | number }[]> {
  const metrics = ["GDP", "Population", "Emissions"];
  const data: { metric: string; [key: string]: string | number }[] = metrics.map((m) => ({ metric: m }));

  const rawData: Record<string, { gdp: number; population: number; emissions: number }> = {};

  for (const code of codes) {
    const gdpSeries = await getCountryGdp(code);
    const popSeries = await getCountryPopulation(code);
    const emSeries = await getCountryEmissions(code);

    const gdp = gdpSeries[gdpSeries.length - 1]?.value ?? 0;
    const population = popSeries[popSeries.length - 1]?.value ?? 0;
    const emissions = emSeries[emSeries.length - 1]?.value ?? 0;

    rawData[code] = { gdp, population, emissions };
  }

  const maxGdp = Math.max(...Object.values(rawData).map((d) => d.gdp));
  const maxPop = Math.max(...Object.values(rawData).map((d) => d.population));
  const maxEm = Math.max(...Object.values(rawData).map((d) => d.emissions));

  for (const code of codes) {
    data[0][code] = Number(((rawData[code].gdp / maxGdp) * 100).toFixed(1));
    data[1][code] = Number(((rawData[code].population / maxPop) * 100).toFixed(1));
    data[2][code] = Number(((rawData[code].emissions / maxEm) * 100).toFixed(1));
  }

  return data;
}

export async function getCompareData(
  type: "gdp" | "population" | "emissions",
  codes: string[],
): Promise<{ year: string; [key: string]: string | number }[]> {
  const allSeries: Record<string, YearValue[]> = {};

  for (const code of codes) {
    if (type === "gdp") allSeries[code] = await getCountryGdp(code);
    else if (type === "population") allSeries[code] = await getCountryPopulation(code);
    else if (type === "emissions") allSeries[code] = await getCountryEmissions(code);
  }

  const yearMap: Record<string, any> = {};

  for (const [code, series] of Object.entries(allSeries)) {
    for (const { year, value } of series) {
      if (!yearMap[year]) yearMap[year] = { year };
      yearMap[year][code] = value;
    }
  }

  return Object.values(yearMap).sort((a, b) => a.year.localeCompare(b.year));
}

export type SectorEmissionsData = {
  iso: string;
  country: string;
  sector: string;
  year: string;
  predictedEmissions: number;
};

export async function getSectorEmissionsPredictions(
  countryNames?: string[],
): Promise<SectorEmissionsData[]> {
  const lines = await readCsv("sector_emissions_predictions_2021_2030.csv");
  const header = parseCsvRow(lines[0]);
  
  const isoIndex = header.indexOf("ISO");
  const countryIndex = header.indexOf("Country");
  const sectorIndex = header.indexOf("Sector");
  const yearIndex = header.indexOf("Year");
  const emissionsIndex = header.indexOf("Predicted_Emissions");

  const results: SectorEmissionsData[] = [];

  const normalizedCountryNames = countryNames?.map(name => name.toLowerCase().trim());

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const country = cols[countryIndex];
    const iso = cols[isoIndex];
    const sector = cols[sectorIndex];
    const year = cols[yearIndex];
    const emissions = safeNumber(cols[emissionsIndex] ?? "");

    if (!country || !iso || !sector || !year || emissions === 0) continue;
    
    if (normalizedCountryNames) {
      const normalizedCountry = country.toLowerCase().trim();
      if (!normalizedCountryNames.includes(normalizedCountry)) continue;
    }

    results.push({
      iso,
      country,
      sector,
      year,
      predictedEmissions: emissions,
    });
  }

  return results;
}

export async function getCountryCodeFromName(countryName: string): Promise<string | null> {
  const countries = await getCountries();
  const country = countries.find(c => c.name === countryName);
  return country?.code ?? null;
}

export async function getCountryCodesFromNames(countryNames: string[]): Promise<string[]> {
  const countries = await getCountries();
  const codes: string[] = [];
  
  for (const name of countryNames) {
    const country = countries.find(c => c.name === name);
    if (country) {
      codes.push(country.code);
    }
  }
  
  return codes;
}

