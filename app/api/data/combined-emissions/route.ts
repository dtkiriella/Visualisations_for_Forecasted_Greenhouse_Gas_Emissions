import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
  if (!value || value === "") return 0;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const year = searchParams.get("year");
    
    const historicalPath = path.join(process.cwd(), "dataset", "historical_emissions.csv");
    const historicalContent = await fs.readFile(historicalPath, "utf-8");
    const historicalLines = historicalContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const historicalHeaders = parseCsvRow(historicalLines[0]);
    
    const yearColumns: Record<string, number> = {};
    for (let i = 0; i < historicalHeaders.length; i++) {
      const header = historicalHeaders[i];
      const yearNum = parseInt(header);
      if (yearNum >= 1990 && yearNum <= 2020) {
        yearColumns[header] = i;
      }
    }

    const isoIndex = historicalHeaders.indexOf("ISO");
    const countryIndex = historicalHeaders.indexOf("Country");
    const sectorIndex = historicalHeaders.indexOf("Sector");
    const gasIndex = historicalHeaders.indexOf("Gas");

    const historicalData: Record<string, Record<string, number>> = {};
    
    for (let i = 1; i < historicalLines.length; i++) {
      const cols = parseCsvRow(historicalLines[i]);
      const countryName = cols[countryIndex];
      const sector = cols[sectorIndex];
      const gas = cols[gasIndex];
      const iso = cols[isoIndex];

      if (sector !== "Total including LUCF") continue;
      if (gas !== "All GHG") continue;

      if (!historicalData[countryName]) {
        historicalData[countryName] = {};
      }

      for (const [year, index] of Object.entries(yearColumns)) {
        const value = safeNumber(cols[index]);
        historicalData[countryName][year] = value;
      }
    }

    const predictionsPath = path.join(process.cwd(), "dataset", "emissions_predictions_2021_2030.csv");
    const predictionsContent = await fs.readFile(predictionsPath, "utf-8");
    const predictionsLines = predictionsContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const predictionsHeaders = parseCsvRow(predictionsLines[0]);
    const predCountryIndex = predictionsHeaders.indexOf("Country");
    const predYearIndex = predictionsHeaders.indexOf("Year");
    const predEmissionsIndex = predictionsHeaders.indexOf("Predicted_Emissions");

    const predictionsData: Record<string, Record<string, number>> = {};
    
    for (let i = 1; i < predictionsLines.length; i++) {
      const cols = parseCsvRow(predictionsLines[i]);
      const countryName = cols[predCountryIndex];
      const yearValue = cols[predYearIndex];
      const emissions = safeNumber(cols[predEmissionsIndex]);

      if (!predictionsData[countryName]) {
        predictionsData[countryName] = {};
      }

      predictionsData[countryName][yearValue] = emissions;
    }

    const combinedData: Record<string, Record<string, number>> = {};
    
    const allCountries = new Set([
      ...Object.keys(historicalData),
      ...Object.keys(predictionsData)
    ]);

    for (const countryName of allCountries) {
      combinedData[countryName] = {
        ...(historicalData[countryName] || {}),
        ...(predictionsData[countryName] || {})
      };
    }

    if (country) {
      const countryData = combinedData[country];
      if (!countryData) {
        return NextResponse.json({ error: "Country not found", data: [] }, { status: 404 });
      }

      const result = Object.entries(countryData)
        .map(([year, value]) => ({ year, value }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      return NextResponse.json({ data: result });
    }

    if (year) {
      const result = Object.entries(combinedData)
        .map(([country, years]) => ({
          country,
          value: years[year] || 0
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      return NextResponse.json({ data: result });
    }

    const result = Object.entries(combinedData).map(([country, years]) => ({
      country,
      years
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error reading combined emissions data:", error);
    return NextResponse.json({ error: "Failed to load data", data: [] }, { status: 500 });
  }
}

