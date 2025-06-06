import { db } from "@/lib/db";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { FileText } from "lucide-react";

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

export default async function CompletionCertificatePage() {
  // Validate page number to ensure it's not negative or zero
  const paymentdetails = await getPaymentDetails();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold text-primary">
          Payment Certificate Management
        </h1>
      </div>
      <Card className="shadow-lg border-t-4 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary to-primary-dark">
          <CardTitle className="text-2xl font-semibold text-white flex items-center">
            <FileText className="mr-2" />
            Payment Certificates - Filtered by NIT No
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={paymentdetails} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
