import { db } from "@/lib/db";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

async function getPaymentDetails() {
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
}

export default async function CompletionCertificatePage({}) {
  const paymentDetails = await getPaymentDetails();
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <DataTable data={paymentDetails} columns={columns} />
    </div>
  );
}
