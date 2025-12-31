import { NextRequest, NextResponse } from "next/server";
import { getSectorEmissionsPredictions } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countriesParam = searchParams.get("countries");
  
  let countryNames: string[] | undefined;
  if (countriesParam) {
    countryNames = countriesParam.split(",").map(c => c.trim());
  }

  try {
    const data = await getSectorEmissionsPredictions(countryNames);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

