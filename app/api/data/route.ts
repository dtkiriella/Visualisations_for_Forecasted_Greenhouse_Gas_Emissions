import { NextRequest, NextResponse } from "next/server";
import {
  getCountries,
  getCountryEmissions,
  getCountryGdp,
  getCountryPopulation,
  getGlobalEmissions,
  getGlobalGdp,
  getGlobalPopulation,
} from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "gdp").toLowerCase();
  const list = searchParams.get("list");
  const country = searchParams.get("country") || undefined;

  try {
    if (list === "countries") {
      const countries = await getCountries();
      return NextResponse.json({ countries });
    }

    if (type === "population") {
      const data = country
        ? await getCountryPopulation(country)
        : await getGlobalPopulation();
      return NextResponse.json({ type, country: country ?? null, data });
    }

    if (type === "emissions") {
      const data = country
        ? await getCountryEmissions(country)
        : await getGlobalEmissions();
      return NextResponse.json({ type, country: country ?? null, data });
    }

    const data = country
      ? await getCountryGdp(country)
      : await getGlobalGdp();
    return NextResponse.json({ type: "gdp", country: country ?? null, data });
  } catch (error) {
    console.error("[API /api/data] error", error);
    return NextResponse.json(
      { error: "Failed to load data." },
      { status: 500 },
    );
  }
}



