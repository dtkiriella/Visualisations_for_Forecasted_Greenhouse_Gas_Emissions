import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCodes = searchParams.get("countries")?.split(",") ?? [];

    if (countryCodes.length === 0) {
      return NextResponse.json({ error: "No countries specified" }, { status: 400 });
    }

    console.log("Requested country codes:", countryCodes);

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

    const countryIndex = historicalHeaders.indexOf("Country");
    const sectorIndex = historicalHeaders.indexOf("Sector");

    const historicalCountries = new Set<string>();
    for (let i = 1; i < historicalLines.length; i++) {
      const cols = parseCsvRow(historicalLines[i]);
      const countryName = cols[countryIndex];
      const isoCode = cols[historicalHeaders.indexOf("ISO")];
      if (countryCodes.includes(isoCode)) {
        historicalCountries.add(countryName);
      }
    }

    console.log("Historical countries found:", Array.from(historicalCountries));

    const historicalData: Record<string, Record<string, number>> = {};
    
    for (let i = 1; i < historicalLines.length; i++) {
      const cols = parseCsvRow(historicalLines[i]);
      const countryName = cols[countryIndex];
      const sector = cols[sectorIndex];
      const isoCode = cols[historicalHeaders.indexOf("ISO")];

      if (!countryCodes.includes(isoCode)) continue;
      if (sector !== "Total including LUCF") continue;

      if (!historicalData[isoCode]) {
        historicalData[isoCode] = {};
      }

      for (const [year, index] of Object.entries(yearColumns)) {
        const value = safeNumber(cols[index]);
        historicalData[isoCode][year] = value;
      }
    }

    const predictionsPath = path.join(process.cwd(), "dataset", "emissions_predictions_2021_2030.csv");
    const predictionsContent = await fs.readFile(predictionsPath, "utf-8");
    const predictionsLines = predictionsContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const predictionsHeaders = parseCsvRow(predictionsLines[0]);
    const predISOIndex = predictionsHeaders.indexOf("ISO");
    const predYearIndex = predictionsHeaders.indexOf("Year");
    const predEmissionsIndex = predictionsHeaders.indexOf("Predicted_Emissions");

    const predictionsData: Record<string, Record<string, number>> = {};
    
    for (let i = 1; i < predictionsLines.length; i++) {
      const cols = parseCsvRow(predictionsLines[i]);
      const isoCode = cols[predISOIndex];
      
      if (!countryCodes.includes(isoCode)) continue;
      
      const yearValue = cols[predYearIndex];
      const emissions = safeNumber(cols[predEmissionsIndex]);

      if (!predictionsData[isoCode]) {
        predictionsData[isoCode] = {};
      }

      predictionsData[isoCode][yearValue] = emissions;
    }

    console.log("Predictions data keys:", Object.keys(predictionsData));

    const allYears = Array.from({ length: 41 }, (_, i) => String(1990 + i)); 
    const combinedByYear: Record<string, any> = {};

    for (const year of allYears) {
      combinedByYear[year] = { year };
      
      for (const countryCode of countryCodes) {
        let value = 0;
        if (parseInt(year) <= 2020) {
          value = historicalData[countryCode]?.[year] || 0;
        } else {
          value = predictionsData[countryCode]?.[year] || 0;
        }
        
        combinedByYear[year][countryCode] = value;
      }
    }

    const result = Object.values(combinedByYear);

    console.log("Returning data with years:", result.length, "first year:", result[0], "last year:", result[result.length - 1]);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error reading combined emissions data:", error);
    return NextResponse.json({ error: "Failed to load data", data: [] }, { status: 500 });
  }
}

