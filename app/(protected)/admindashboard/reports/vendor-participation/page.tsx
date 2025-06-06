import { db } from "@/lib/db";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/utils";

const VendorParticipationPage = async () => {
  const vendors = await db.agencyDetails.findMany({
    include: {
      Bidagency: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true,
            },
          },
          workorderdetails: {
            include: {
              awardofcontractdetails: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Participation Report
          </h1>
          <div className="text-sm text-gray-500">
            Total Vendors: {vendors.length}
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-700">
                    Agency Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">
                    Total Works
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">
                    Work Orders
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => {
                  const totalWorks =
                    vendor.Bidagency?.reduce(
                      (sum, bid) => sum + (bid.WorksDetail ? 1 : 0),
                      0
                    ) || 0;

                  const totalWorkOrders =
                    vendor.Bidagency?.reduce(
                      (sum, bid) => sum + (bid.workorderdetails?.length || 0),
                      0
                    ) || 0;

                  const status = totalWorks > 0 ? "Active" : "Inactive";

                  return (
                    <TableRow
                      key={vendor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="link"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {totalWorks}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                Works Details - {vendor.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold">
                                      Work ID
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Action Plan
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Description
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {vendor.Bidagency?.map((bid, i) =>
                                    bid.WorksDetail ? (
                                      <TableRow
                                        key={bid.WorksDetail.id}
                                        className="hover:bg-gray-50"
                                      >
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                          {bid.WorksDetail
                                            .ApprovedActionPlanDetails
                                            ?.activityDescription || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                          {bid.WorksDetail
                                            .finalEstimateAmount ||
                                            "No description"}
                                        </TableCell>
                                        <TableCell>
                                          <span
                                            className={`px-2 py-1 rounded-full text-sm ${
                                              bid.WorksDetail.workStatus ===
                                              "workcompleted"
                                                ? "bg-green-100 text-green-800"
                                                : bid.WorksDetail.workStatus ===
                                                  "billpaid"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {bid.WorksDetail.workStatus}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ) : null
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="link"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {totalWorkOrders}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                Work Orders - {vendor.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="font-semibold">
                                      Order ID
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Date
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Contract ID
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {vendor.Bidagency?.map((bid) =>
                                    bid.workorderdetails?.map((order) => (
                                      <TableRow
                                        key={order.id}
                                        className="hover:bg-gray-50"
                                      >
                                        <TableCell>{`${
                                          order.awardofcontractdetails
                                            .workodermenonumber
                                        }/DGP/${order.awardofcontractdetails.workordeermemodate.getFullYear()}`}</TableCell>
                                        <TableCell>
                                          {order.awardofcontractdetails
                                            .workordeermemodate
                                            ? formatDate(
                                                order.awardofcontractdetails
                                                  .workordeermemodate
                                              )
                                            : ""}
                                        </TableCell>
                                        <TableCell>
                                          {
                                            order.awardofcontractdetails
                                              .isdelivery
                                          }
                                        </TableCell>
                                        <TableCell>
                                          {
                                            order.awardofcontractdetails
                                              .isdelivery
                                          }
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorParticipationPage;
