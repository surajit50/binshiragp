
// app/api/villages/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "2024");

  try {
    const villages = await db.village.findMany({
      include: {
        yearlyData: {
          where: { year },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: villages.filter((v) => v.yearlyData.length > 0),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch village data",
      },
      { status: 500 }
    );
  }
}
