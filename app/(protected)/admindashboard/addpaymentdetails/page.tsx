import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Building2, IndianRupee, Hash } from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";

async function fetchWorkDetails() {
  try {
    return await db.worksDetail.findMany({
      where: {
        tenderStatus: "AOC",
        awardofContractId: { not: null },
        paymentDetails: { none: { isfinalbill: true } },
      },
      include: {
        nitDetails: true,
        paymentDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: { include: { agencydetails: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch work details:", error);
    throw new Error("Failed to fetch work details. Please try again later.");
  }
}

export default async function WorkDetailsPage() {
  const workDetails = await fetchWorkDetails();

  // Calculate totals
  const totalWorks = workDetails.length;
  const totalAwardedValue = workDetails.reduce((sum, work) => {
    const amount =
      work.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0;
    return sum + amount;
  }, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Works</p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">
                  {totalWorks}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Awarded Value
                </p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(totalAwardedValue)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Work Details
              </CardTitle>
              <CardDescription className="text-blue-100">
                Overview of ongoing projects with awarded contracts
              </CardDescription>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="p-4 font-semibold text-gray-700">
                    SL No
                  </TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">
                    NIT Details
                  </TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">
                    Work Name
                  </TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">
                    Agency Name
                  </TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700">
                    Awarded Cost
                  </TableHead>
                  <TableHead className="p-4 font-semibold text-gray-700 text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workDetails.length > 0 ? (
                  workDetails.map((work, index) => (
                    <TableRow key={work.id} className="hover:bg-gray-50/50">
                      <TableCell className="p-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <ShowNitDetails
                          nitdetails={work.nitDetails.memoNumber}
                          memoDate={work.nitDetails.memoDate}
                          workslno={work.workslno}
                        />
                      </TableCell>
                      <TableCell className="p-4 font-medium">
                        {work.ApprovedActionPlanDetails?.activityDescription}
                      </TableCell>
                      <TableCell className="p-4">
                        {
                          work.AwardofContract?.workorderdetails[0]?.Bidagency
                            ?.agencydetails?.name
                        }
                      </TableCell>
                      <TableCell className="p-4 font-semibold text-green-700">
                        {formatCurrency(
                          work.AwardofContract?.workorderdetails[0]?.Bidagency
                            ?.biddingAmount || 0
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/admindashboard/addpaymentdetails/${work.id}`}
                          passHref
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="p-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg">No work details found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add new work details to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
