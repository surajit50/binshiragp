import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workStatus } = body;

    if (!workStatus) {
      return NextResponse.json(
        { error: "Missing work status" },
        { status: 400 }
      );
    }

    // Update work status
    const updatedWork = await db.worksDetail.update({
      where: { id: params.id },
      data: {
        workStatus,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWork,
    });
  } catch (error) {
    console.error("Work status update error:", error);
    return NextResponse.json(
      { error: "Failed to update work status" },
      { status: 500 }
    );
  }
} 