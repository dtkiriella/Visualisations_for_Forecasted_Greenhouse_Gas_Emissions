import { NextRequest, NextResponse } from "next/server";
import { getTopCountriesByMetric } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "gdp" | "population" | "emissions" | null;
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const year = searchParams.get("year") || undefined;

  if (!type || !["gdp", "population", "emissions"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const data = await getTopCountriesByMetric(type, limit, year);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

