import React from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, WarishApplication } from "./warish-columns";
import { DataTable } from "@/components/data-table";
import { Info } from "lucide-react";

const WarishRenewPage = async () => {
  const today = new Date();
  const currentYear = today.getFullYear().toString();

  const warishApplications = await db.warishApplication.findMany({
    where: {
      warishApplicationStatus: "approved",
      OR: [
        { renewdate: { lte: today } },
        { approvalYear: { not: currentYear } },
      ],
    },
    select: {
      id: true,
      applicantName: true,
      warishRefNo: true,
      warishRefDate: true,
      renewdate: true,
      approvalYear: true,
    },
    orderBy: {
      renewdate: "asc",
    },
  });

  // Type assertion to match the WarishApplication type
  const typedWarishApplications: WarishApplication[] = warishApplications.map(
    (app) => ({
      ...app,
      warishRefNo: app.warishRefNo || undefined,
      warishRefDate: app.warishRefDate || undefined,
      renewdate: app.renewdate || undefined,
      approvalYear: app.approvalYear || undefined,
    })
  );

  return (
    <div className="container mx-auto py-12">
      <Card className="shadow-lg max-w-6xl mx-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Renewal Management
            </CardTitle>
            <p className="text-sm text-gray-500">
              Applications requiring renewal attention. Sorted by nearest renewal date.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {typedWarishApplications.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <DataTable 
                columns={columns} 
                data={typedWarishApplications}
                />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Info className="h-8 w-8 text-blue-500" />
              <p className="text-gray-600 font-medium">
                All caught up! No applications require immediate renewal.
              </p>
              <p className="text-sm text-gray-500">
                Applications will appear here when renewal is needed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarishRenewPage;
