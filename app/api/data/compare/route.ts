import { NextRequest, NextResponse } from "next/server";
import { getCompareData } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "gdp" | "population" | "emissions" | null;
  const countries = searchParams.get("countries")?.split(",") ?? [];

  if (!type || !["gdp", "population", "emissions"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (countries.length === 0) {
    return NextResponse.json({ error: "No countries specified" }, { status: 400 });
  }

  try {
    const data = await getCompareData(type, countries);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

