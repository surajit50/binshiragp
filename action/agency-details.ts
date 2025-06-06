"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { vendorSchema } from "@/schema/venderschema";

type VendorSchemaType = z.infer<typeof vendorSchema>;

export const deleteAgency = async (id: string) => {
  try {
    await db.agencyDetails.delete({
      where: { id: id },
    });
    return { success: "Agency deleted successfully" };
  } catch (error) {
    console.error("Error deleting agency:", error);
    return { error: "Failed to delete agency" };
  }
};

export const updateAgencyDetails = async (
  data: VendorSchemaType,
  id: string
) => {
  try {
    const validatedData = vendorSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        error: "Validation failed",
        details: validatedData.error.flatten().fieldErrors,
      };
    }

    const { name, gst, tin, postalAddress, mobileNumber, email, pan } =
      validatedData.data;

    await db.agencyDetails.update({
      where: { id: id },
      data: {
        name,
        gst,
        tin,
        mobileNumber,
        email,
        pan,
        contactDetails: postalAddress, // Ensure this field mapping matches your DB schema
      },
    });

    return { success: "Agency updated successfully" };
  } catch (error) {
    console.error("Error updating agency:", error);
    return { error: "Failed to update agency details" };
  }
};
