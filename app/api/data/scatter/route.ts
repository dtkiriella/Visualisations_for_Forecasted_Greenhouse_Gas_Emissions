import { NextRequest, NextResponse } from "next/server";
import { getScatterData } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || undefined;

  try {
    const data = await getScatterData(year);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

