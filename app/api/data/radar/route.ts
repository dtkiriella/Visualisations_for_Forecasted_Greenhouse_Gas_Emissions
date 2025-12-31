import { NextRequest, NextResponse } from "next/server";
import { getRadarData } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countries = searchParams.get("countries")?.split(",") ?? [];

  if (countries.length === 0) {
    return NextResponse.json({ error: "No countries specified" }, { status: 400 });
  }

  try {
    const data = await getRadarData(countries);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

