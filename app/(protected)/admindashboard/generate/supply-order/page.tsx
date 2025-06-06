import { db } from "@/lib/db";
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

const SupplyOrderPage = async () => {
  const workOrders = await db.workorderdetails.findMany({
    where: {
      Bidagency: {
        WorksDetail: {
          nitDetails: {
            isSupply: true,
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

  // Transform the data to match the table structure

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Supply Orders</h1>
      <DataTable columns={columns} data={workOrders} />
    </div>
  );
};

export default SupplyOrderPage;
