import { db } from "@/lib/db";
import { WorkList } from "./WorkList";
import { Metadata } from "next";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Add metadata for better SEO and page information
export const metadata: Metadata = {
  title: "Generate Completion Certificates",
  description: "Generate completion certificates for completed works",
};

async function getPaymentDetails() {
  try {
    return await db.worksDetail.findMany({
      where: {
        paymentDetails: { some: {} },
      },
      include: {
        nitDetails: true,
        biddingAgencies: true,
        paymentDetails: {
          include: {
            lessIncomeTax: true,
            lessLabourWelfareCess: true,
            lessTdsCgst: true,
            lessTdsSgst: true,
            securityDeposit: true,
          },
        },
        ApprovedActionPlanDetails: true,
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
      },
      orderBy: {
        nitDetails: {
          memoNumber: "asc",
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    throw new Error("Failed to load work details. Please try again later.");
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg font-medium">Loading works...</span>
      </div>
    </div>
  );
}

export default async function CompletionCertificatePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Generate Completion Certificates</h1>
        <p className="text-muted-foreground">
          Select works and generate completion certificates for finished
          projects
        </p>
      </div>

      <WorkListWrapper />
    </div>
  );
}

// Separate async component to handle data fetching
async function WorkListWrapper() {
  const paymentDetails = await getPaymentDetails();
  return <WorkList works={paymentDetails} />;
}
