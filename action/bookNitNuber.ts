"use server";

import { biderdetailsValidationSchema } from "@/components/form/AddBidder";
import {
  AddTechnicalDetailsSchema,
  AddTechnicalDetailsSchemaType,
} from "@/schema/tender-management-schema";
import { TenderStatus } from "@prisma/client";

import { bidagencybyid, currentUser } from "@/lib/auth";

import { db } from "@/lib/db";
import { ApprovedActionPlanDetails } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAgreement } from "./create-agrement";
import { CreateAgreementInput } from "@/types/agreement";
import { register } from "@/lib/register";
import { sentAwardedNotification } from "@/lib/mail";
import { NitBookValidationSchema } from "@/schema";
import { emailServiceStatus } from "@/lib/emailservide";
export const bookNitNumber = async (
  values: z.infer<typeof NitBookValidationSchema>
) => {
  try {
    // Parse and validate the form data
    const validatedData = NitBookValidationSchema.parse({
      tendermemonumber: values.tendermemonumber,
      tendermemodate: values.tendermemodate,
      tender_pulishing_Date: values.tender_pulishing_Date,
      tender_document_Download_from: values.tender_document_Download_from,
      tender_start_time_from: values.tender_start_time_from,
      tender_end_date_time_from: values.tender_end_date_time_from,
      tender_techinical_bid_opening_date:
        values.tender_techinical_bid_opening_date,
      tender_financial_bid_opening_date:
        values.tender_financial_bid_opening_date,
      tender_place_opening_bids: values.tender_place_opening_bids,
      tender_vilidity_bids: values.tender_vilidity_bids,
      supplynit: values.supplynit,
      supplyitemname: values.supplyitemname,
      nitCount: values.nitCount,
    });

    // Check if the NIT number already exists in the same year
    const existingNit = await db.nitDetails.findFirst({
      where: {
        AND: [
          { memoNumber: parseInt(validatedData.tendermemonumber) },
          {
            memoDate: {
              gte: new Date(validatedData.tendermemodate.getFullYear(), 0, 1),
              lte: new Date(validatedData.tendermemodate.getFullYear(), 11, 31),
            },
          },
        ],
      },
    });

    if (existingNit) {
      return { error: "NIT memo number already exists for this year" };
    }

    // Create a new NIT in the database
    const nitbook = await db.nitDetails.create({
      data: {
        memoNumber: parseInt(values.tendermemonumber),
        memoDate: values.tendermemodate,
        publishingDate: values.tender_pulishing_Date,
        documentDownloadFrom: values.tender_document_Download_from,
        startTime: values.tender_start_time_from,
        endTime: values.tender_end_date_time_from,
        technicalBidOpeningDate: values.tender_techinical_bid_opening_date,
        financialBidOpeningDate: values.tender_financial_bid_opening_date,
        placeOfOpeningBids: values.tender_place_opening_bids,
        bidValidity: parseInt(values.tender_vilidity_bids),
        isSupply: values.supplynit,
        supplyitemname: values.supplynit ? values.supplyitemname : null, // Only set if supplynit is true
        nitCount: values.nitCount,
      },
    });

    revalidatePath("/admindashboard/manage-tender/add");
    return { success: "Tender Booked Successfully" };
  } catch (error) {
    console.error("Error creating tender:", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => err.message);
      return { error: errorMessages.join(", ") };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create tender. Please try again." };
  } finally {
    await db.$disconnect();
  }
};

const NitUpdateValidationSchema = z.object({
  id: z.string().nonempty("NIT ID is required"),
  tendermemonumber: z.string().nonempty("Tender Reference Number is required"),
  tendermemodate: z.coerce.date(),
  tender_pulishing_Date: z.coerce.date(),
  tender_document_Download_from: z.coerce.date(),
  tender_start_time_from: z.coerce.date(),
  tender_end_date_time_from: z.coerce.date(),
  tender_techinical_bid_opening_date: z.coerce.date(),
  tender_financial_bid_opening_date: z.coerce.date().optional(),
  tender_place_opening_bids: z
    .string()
    .nonempty("Place for Opening Bids is required"),
  tender_vilidity_bids: z.string().nonempty("Validity of Bids is required"),
  supplynit: z.boolean().optional(),
});

export async function updateNitNumber(formData: FormData) {
  try {
    // Parse and validate the form data
    const validatedData = NitUpdateValidationSchema.parse({
      id: formData.get("id"),
      tendermemonumber: formData.get("tendermemonumber"),
      tendermemodate: formData.get("tendermemodate"),
      tender_pulishing_Date: formData.get("tender_pulishing_Date"),
      tender_document_Download_from: formData.get(
        "tender_document_Download_from"
      ),
      tender_start_time_from: formData.get("tender_start_time_from"),
      tender_end_date_time_from: formData.get("tender_end_date_time_from"),
      tender_techinical_bid_opening_date: formData.get(
        "tender_techinical_bid_opening_date"
      ),
      tender_financial_bid_opening_date: formData.get(
        "tender_financial_bid_opening_date"
      ),
      tender_place_opening_bids: formData.get("tender_place_opening_bids"),
      tender_vilidity_bids: formData.get("tender_vilidity_bids"),
      supplynit: formData.get("supplynit") === "on",
    });

    // Update the NIT in the database
    const updatedNit = await db.nitDetails.update({
      where: { id: validatedData.id },
      data: {
        memoNumber: parseInt(validatedData.tendermemonumber),
        memoDate: validatedData.tendermemodate,
        publishingDate: validatedData.tender_pulishing_Date,
        documentDownloadFrom: validatedData.tender_document_Download_from,
        startTime: validatedData.tender_start_time_from,
        endTime: validatedData.tender_end_date_time_from,
        technicalBidOpeningDate:
          validatedData.tender_techinical_bid_opening_date,
        financialBidOpeningDate:
          validatedData.tender_financial_bid_opening_date,
        placeOfOpeningBids: validatedData.tender_place_opening_bids,
        bidValidity: parseInt(validatedData.tender_vilidity_bids),
        isSupply: validatedData.supplynit,
      },
    });

    // Revalidate the NITs page to reflect the changes
    revalidatePath("/nits");

    return { success: "Tender Updated Successfully" };
  } catch (error) {
    console.error("Error updating NIT:", error);
    if (error instanceof z.ZodError) {
      // Handle validation errors
      const errorMessages = error.errors.map((err) => err.message);
      return { error: errorMessages.join(", ") };
    }
    return { error: "Error in Updating Tender" };
  } finally {
    await db.$disconnect();
  }
}

export const fetchWork = async () => {
  try {
    const work = await db.approvedActionPlanDetails.findMany({
      where: {
        isPublish: false,
      },
    });

    return work;
  } catch (error) {
    console.error("Error fetching work:", error);
  }
};

export const getAgencyDetails = async () => {
  try {
    const agency = await db.agencyDetails.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return agency;
  } catch (error) {
    console.log(error);
  } finally {
    await db.$disconnect();
  }
};

export const getAgencyDetailsById = async (agencyid: string) => {
  try {
    const agency = await db.agencyDetails.findUnique({
      where: {
        id: agencyid,
      },
      select: {
        name: true,
      },
    });

    return agency;
  } catch (error) {
    console.log(error);
  }
};
export const addBiderDetails = async (
  values: z.infer<typeof biderdetailsValidationSchema>,
  worksDetailId: string
) => {
  const { bidderdetails } = values; // bidderdetails is an array of agencyDetailsId

  try {
    const stage = await db.worksDetail.findFirst({
      where: {
        id: worksDetailId,
        tenderStatus: { notIn: ["published", "TechnicalBidOpening"] },
      },
    });

    if (stage !== null) {
      return { error: "Invalid Tender" };
    }

    // Check if any of the bidders already exist
    const existingBidders = await db.bidagency.findMany({
      where: {
        agencyDetailsId: { in: bidderdetails }, // Check if any selected IDs already exist
        worksDetailId,
      },
      select: { agencyDetailsId: true },
    });

    const existingBidderIds = new Set(
      existingBidders.map((b) => b.agencyDetailsId)
    );

    // Filter out already existing bidders
    const newBidders = bidderdetails.filter((id) => !existingBidderIds.has(id));

    if (newBidders.length === 0) {
      return { error: "All selected bidders already exist" };
    }

    // Insert new bidders
    const bidders = await db.bidagency.createMany({
      data: newBidders.map((agencyDetailsId) => ({
        agencyDetailsId,
        worksDetailId,
      })),
    });

    await db.worksDetail.update({
      where: { id: worksDetailId },
      data: { tenderStatus: "TechnicalBidOpening" },
    });

    console.log("Bidders added successfully:", bidders);
    revalidatePath("/admindashboard/manage-tender/addbidderdetails");
    return {
      success: `${newBidders.length} bidder(s) added successfully`,
      bidders,
    };
  } catch (error) {
    console.error("Error creating bidders:", error);
    return { error: "Failed to add bidders" };
  }
};

export async function removeBiddingAgency(workId: string, agencyId: string) {}

export const updatebitvalue = async (data: FormData) => {
  const agenid = data.get("agencyid") as string;
  const biddingamount = data.get("biddingamount") as string;
  try {
    const amt = parseInt(biddingamount);

    if (amt == null) {
      return false;
    }
    const agg = await db.bidagency.update({
      where: {
        id: agenid,
      },
      data: {
        biddingAmount: amt,
      },
    });

    const wid = await agg.worksDetailId;

    if (!wid) {
      return false;
    }

    await db.worksDetail.update({
      where: {
        id: wid,
      },
      data: {
        tenderStatus: "TechnicalBidOpening",
      },
    });
  } catch (error) {
    console.log(error);
  } finally {
    await db.$disconnect();
  }
};

export async function sentforTechnicalevelution(formData: FormData) {
  const workid = formData.get("workid") as string;

  if (!workid) {
    throw new Error("Work ID is missing.");
  }

  try {
    await db.worksDetail.update({
      where: { id: workid },
      data: { tenderStatus: "TechnicalEvaluation" },
    });

    // Revalidate the page that displays the work details
    revalidatePath(`/admindashboard/manage-tender/addbidderdetails`);

    // Redirect to the manage tender page
    redirect("/admindashboard/manage-tender/addbidderdetails");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    throw new Error("Failed to update tender status");
  } finally {
    await db.$disconnect();
  }
}

export const addtechnicaldetailsofagency = async (
  values: z.infer<typeof AddTechnicalDetailsSchema>,
  bidagencyid: string
) => {
  try {
    const {
      credencial,
      declaration,
      validityofdocument,
      byelow,
      pfregistrationupdatechalan,
      machinary,
      qualify,
      remarks,
    } = values;

    // Find the specific bid agency
    const existingBidAgency = await db.bidagency.findUnique({
      where: {
        id: bidagencyid,
      },
    });

    // If no bid agency is found
    if (!existingBidAgency) {
      return { error: "Invalid bid agency" };
    }

    // Create the credencial record
    const credencialRecord = await db.credencial.create({
      data: {
        sixtyperamtput: credencial.sixtyperamtput || false,
        workorder: credencial?.workorder || false,
        paymentcertificate: credencial?.paymentcertificate || false,
        comcertificat: credencial?.comcertificat || false,
      },
    });

    // Create the validityofdocument record
    const validityofdocumentRecord = await db.validityofdocument.create({
      data: {
        itreturn: validityofdocument?.itreturn || false,
        gst: validityofdocument?.gst || false,
        tradelicence: validityofdocument?.tradelicence || false,
        ptax: validityofdocument?.ptax || false,
      },
    });

    // Create the technical evaluation document
    const technicalDocument = await db.technicalEvelutiondocument.create({
      data: {
        remarks: remarks || null, // Set default value if needed
        declaration: declaration || false, // Default value if needed
        byelow: byelow || false, // Default value if needed
        pfregistrationupdatechalan: pfregistrationupdatechalan || false, // Default value if needed
        machinary: machinary || false, // Default value if needed
        qualify: qualify || false, // Default value if needed

        // Link the newly created records
        credencial: {
          connect: { id: credencialRecord.id },
        },
        validityofdocument: {
          connect: { id: validityofdocumentRecord.id },
        },

        // Link to the existing bid agency
        bidagencyId: existingBidAgency.id, // Assuming this is the correct way to link
      },
    });

    await db.bidagency.update({
      where: {
        id: existingBidAgency.id,
      },
      data: {
        technicalEvelutiondocumentId: technicalDocument.id,
      },
    });
    revalidatePath(`/admindashboard/manage-tender/addtechnicaldetails/`);
    return { success: "value Insert Succefully" };
  } catch (error) {
    console.error("Error creating technical evaluation document:", error);
    return {
      error:
        "An error occurred while creating the technical evaluation document",
    };
  } finally {
    await db.$disconnect();
  }
};

export const sentforfinanicalbidadd = async (data: FormData) => {
  const workid = data.get("workid") as string;

  try {
    const data = await db.worksDetail.update({
      where: {
        id: workid,
      },
      data: {
        tenderStatus: "FinancialBidOpening",
      },
    });
    redirect("/admindashboard/manage-tender/addtechnicaldetails");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
  } finally {
    await db.$disconnect();
  }
};

export const addFinancialDetails = async (
  agencyid: string,
  bidamount: string,
  tenderid: string
) => {
  if (!agencyid || !bidamount || !tenderid) {
    return { error: "Missing required parameters" };
  }

  try {
    // Start a transaction to ensure data consistency
    return await db.$transaction(async (tx) => {
      // Find the work associated with the tender ID
      const work = await tx.worksDetail.findUnique({
        where: { id: tenderid },
        include: {
          biddingAgencies: {
            where: { id: agencyid },
          },
        },
      });

      // Validate work exists
      if (!work) {
        return { error: "Invalid tender ID" };
      }


      // Validate bid agency exists
      if (!work.biddingAgencies.length) {
        return { error: "Invalid bid agency for this tender" };
      }

      // Validate bid amount
      const intBid = parseInt(bidamount);
      if (isNaN(intBid) || intBid <= 0) {
        return { error: "Invalid bidding amount. Must be a positive number" };
      }

      // Update the bidding amount for the agency
      await tx.bidagency.update({
        where: { id: agencyid },
        data: { biddingAmount: intBid },
      });

      // Update tender status
      await tx.worksDetail.update({
        where: { id: tenderid },
        data: { tenderStatus: "FinancialEvaluation" },
      });

      return {
        success: true,
        message: "Financial details added successfully",
        data: {
          tenderId: tenderid,
          agencyId: agencyid,
          bidAmount: intBid,
        },
      };
    });
  } catch (error) {
    console.error("Error in addFinancialDetails:", error);

    if (isRedirectError(error)) {
      throw error;
    }

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update does not exist")) {
        return { error: "Bid agency or tender not found" };
      }
      if (error.message.includes("Unique constraint failed")) {
        return { error: "Duplicate financial details entry" };
      }
    }

    return { error: "Failed to update financial details. Please try again." };
  } finally {
    await db.$disconnect();
  }
};

export const addAoCdetails = async (formData: FormData) => {
  try {
    const workodermenonumber = formData.get("memono") as string;
    const workordeermemodate = new Date(formData.get("memodate") as string);
    const worksDetailId = formData.get("workId") as string;
    const bidagencyId = formData.get("acceptbidderId") as string | null;

    // Ensure necessary fields are provided
    if (!workodermenonumber || !worksDetailId) {
      return { error: "Missing required fields: memono or workId" };
    }

    if (!bidagencyId) {
      return { error: "Please select a bidder" };
    }

    const existingWork = await db.worksDetail.findUnique({
      where: {
        id: worksDetailId,
      },
    });

    if (!existingWork) {
      return { error: "Work not found" };
    }

    if (existingWork.tenderStatus !== "FinancialEvaluation") {
      return { error: "Work must be in Financial Evaluation status" };
    }

    if (existingWork.awardofContractId) {
      return { error: "Work already has an AOC" };
    }

    // Create the AOC record
    const aoc = await db.awardofContract.create({
      data: {
        workodermenonumber,
        workordeermemodate,
      },
    });

    // Create the workorderdetails record and link it to the AOC and Bidagency
    const workorderDetails = await db.workorderdetails.create({
      data: {
        awardofContractId: aoc.id,
        bidagencyId,
      },
    });

    // Update WorksDetail to associate with the newly created AOC and update tenderStatus
    const work = await db.worksDetail.update({
      where: {
        id: worksDetailId,
      },
      data: {
        workStatus: "workorder",
        tenderStatus: "AOC",
        AwardofContract: {
          connect: { id: aoc.id },
        },
      },
    });

    const inputdata: CreateAgreementInput = {
      aggrementno: `AGR-${aoc.workordeermemodate.getFullYear()}-${String(
        aoc.workodermenonumber
      ).padStart(4, "0")}/${work.workslno}`,
      aggrementdate: aoc.workordeermemodate.toISOString(),
      approvedActionPlanDetailsId: work.approvedActionPlanDetailsId,
      bidagencyId: bidagencyId,
    };

    const fetchnitdetais = await db.nitDetails.findUnique({
      where: {
        id: work.nitDetailsId,
      },
    });
    const agrement = await createAgreement(inputdata);
    await register(bidagencyId, work.earnestMoneyFee);
    const bidder = await bidagencybyid(bidagencyId);
    if (!bidder) {
      return { error: "Bidder not found" };
    }

    const emailsstatus = await emailServiceStatus();

    if (emailsstatus && bidder.agencydetails.email) {
      await sentAwardedNotification(
        bidder.agencydetails.email,
        fetchnitdetais?.memoNumber || 0,
        fetchnitdetais?.memoDate || new Date(),
        work.workslno,
        bidder.agencydetails.name
      );
    }

    
    return { success: "AOC created successfully" };
  } catch (error) {
    console.error("Error in addAoCdetails:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  } finally {
    await db.$disconnect();
  }
};

export async function deleteBidder(formData: FormData) {
  const agencyId = formData.get("agencyId");
  const workId = formData.get("workId");

  if (!agencyId || !workId) {
    throw new Error("Missing required fields");
  }

  if (typeof agencyId !== "string" || typeof workId !== "string") {
    throw new Error("Invalid input types");
  }

  try {
    await db.bidagency.delete({
      where: {
        id: agencyId,
        worksDetailId: workId,
      },
    });

    revalidatePath(`/admindashboard/manage-tender/addbidderdetails/${workId}`);
  } catch (error) {
    console.error("Failed to delete bidder:", error);
    throw new Error("Failed to delete bidder. Please try again.");
  }
}

export async function updatetechnicaldetailsofagency(
  data: AddTechnicalDetailsSchemaType,
  agencyId: string
) {}

export async function fetchNitNo(): Promise<
  { memoNumber: string; memoDate: Date }[]
> {
  try {
    const nit = await db.nitDetails.findMany({
      select: {
        memoNumber: true,
        memoDate: true,
      },
      distinct: ["memoNumber"], // Ensure unique memoNumbers
    });

    return nit.map((item) => ({
      memoNumber: item.memoNumber.toString(),
      memoDate: new Date(item.memoDate), // Ensure memoDate is a Date object
    }));
  } catch (error) {
    console.error("Error fetching NIT numbers:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

export async function fetchworkdetailsbynitno(nitNO: number) {
  try {
    const work = await db.worksDetail.findMany({
      where: {
        nitDetails: {
          memoNumber: nitNO,
        },
      },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        biddingAgencies: {
          include: {
            agencydetails: true,
            workorderdetails: true,
          },
        },
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: {
                  include: {
                    agencydetails: true,
                  },
                },
              },
            },
          },
        },
        paymentDetails: true,
      },
    });

    return work; // Return the fetched data
  } catch (error) {
    console.error("Error fetching work details:", error); // Log the error
    throw new Error("Failed to fetch work details."); // Provide a meaningful error message
  }
}

export const updatenitstatus = async (
  workid: string,
  tenderStatus: TenderStatus
) => {
  try {
    const work = await db.worksDetail.update({
      where: {
        id: workid,
      },
      data: {
        tenderStatus, // Assuming you want to update tenderStatus too
        ApprovedActionPlanDetails: {
          update: {
            // Use `updateMany` if multiple records might exist
            where: {}, // Add specific conditions if necessary
            data: {
              isPublish: false,
            },
          },
        },
      },
    });

    console.log("Updated work details:", work);
    return work;
  } catch (error) {
    console.error("Error updating NIT status:", error);
  }
};

// Add this in a separate file like actions/delete-nit.ts

export async function deleteNitAction(id: string) {
  if (!id) {
    throw new Error("NIT ID is required");
  }

  const cuser = await currentUser();

  if (!cuser) {
    throw new Error("User not authenticated");
  }
  if (cuser.role !== "admin") {
    throw new Error("User not authorized to delete NIT");
  }
  if (typeof id !== "string") {
    throw new Error("Invalid NIT ID");
  }

  try {
    // First check if NIT exists and has no works
    const nit = await db.nitDetails.findUnique({
      where: { id },
      include: { WorksDetail: true },
    });

    if (!nit) {
      throw new Error("NIT not found");
    }

    if (nit.WorksDetail.length > 0) {
      throw new Error("Cannot delete NIT with existing works");
    }

    // Delete the NIT
    await db.nitDetails.delete({
      where: { id },
    });

    // Revalidate the page to refresh the UI
    revalidatePath("/admindashboard/manage-tender/view");

    return { success: "NIT deleted successfully" };
  } catch (error) {
    console.error("Error deleting NIT:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete NIT"
    );
  } finally {
    await db.$disconnect();
  }
}
