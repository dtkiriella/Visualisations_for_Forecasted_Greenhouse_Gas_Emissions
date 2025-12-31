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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "dataset", "sector_emissions_predictions_2021_2030 - Copy.csv");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const headers = parseCsvRow(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvRow(lines[i]);
      if (cols.length >= 5) {
        data.push({
          ISO: cols[0],
          Country: cols[1],
          Sector: cols[2],
          Year: parseInt(cols[3]) || 0,
          Predicted_Emissions: parseFloat(cols[4]) || 0,
        });
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error reading sector emissions predictions:", error);
    return NextResponse.json({ error: "Failed to load data", data: [] }, { status: 500 });
  }
}

