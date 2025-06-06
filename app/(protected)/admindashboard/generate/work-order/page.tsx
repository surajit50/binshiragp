import React from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { db } from "@/lib/db";
import { FileText } from "lucide-react";

const WorkOrderPage = async () => {
  const data = await db.workorderdetails.findMany({
    where: {
      Bidagency: {
        WorksDetail: {
          nitDetails: {
            isSupply: false,
          },
        },
      },
    },
    include: {
      awardofcontractdetails: true,
      Bidagency: {
        include: {
          agencydetails: true,
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
              nitDetails: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b">
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold text-gray-900">Work Orders</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default WorkOrderPage;
