import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      paymentMethod,
      paymentDate,
      chequeNumber,
      chequeDate,
      paymentstatus,
    } = body;

    const updatedEmd = await db.earnestMoneyRegister.update({
      where: {
        id: params.id,
      },
      data: {
        paymentMethod,
        paymentDate,
        chequeNumber,
        chequeDate,
        paymentstatus,
      },
    });

    return NextResponse.json(updatedEmd);
  } catch (error) {
    console.error("[EMD_PAYMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
