"use server";

import { db } from "@/lib/db";

import { revalidatePath } from "next/cache";

export async function verifyAllDocuments(warishId: string) {
  // Update all documents for this warish application
  await db.warishDocument.updateMany({
    where: {
      warishId,
      verified: false,
    },
    data: {
      verified: true,
      remarks: "Verified in bulk",
    },
  });

  // Update the warish application status
  await db.warishApplication.update({
    where: { id: warishId },
    data: { warishdocumentverified: true },
  });

  revalidatePath(`/admindashboard/manage-warish/verify-document/${warishId}`);
}
