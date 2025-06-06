
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PDFGeneratorComponent from "@/components/PrintTemplet/ScrutnisheetTemplete";
import { scrutneesheettype } from "@/types/worksdetails";
import { Suspense } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

async function getWorkDetails(): Promise<scrutneesheettype[]> {
  try {
    const workdetails = await db.worksDetail.findMany({
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        biddingAgencies: {
          include: {
            agencydetails: true,
            technicalEvelution: {
              include: {
                credencial: true,
                validityofdocument: true,
              },
            },
          },
        },
      },
    });
    return workdetails;
  } catch (error) {
    console.error("Failed to fetch work details:", error);
    throw new Error("Failed to fetch work details. Please try again later.");
  }
}

export default async function WorkList() {
  let works: scrutneesheettype[] = [];
  let error = null;

  try {
    works = await getWorkDetails();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-none shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground">
            <CardTitle className="text-3xl font-bold flex items-center">
              <Briefcase className="w-8 h-8 mr-3" />
              Work List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700">
                  Something went wrong.
                </p>
                <p className="text-muted-foreground mt-2">{error}</p>
              </div>
            ) : (
              <Suspense fallback={<LoadingState />}>
                <WorkListContent works={works} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function WorkListContent({ works }: { works: scrutneesheettype[] }) {
  return (
    <>
      {works.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">No works found.</p>
          <p className="text-muted-foreground mt-2">
            There are currently no works available in the system.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <DataTable data={works} columns={columns} />
        </div>
      )}
    </>
  );
}
