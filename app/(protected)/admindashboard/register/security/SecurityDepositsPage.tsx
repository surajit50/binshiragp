"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  IndianRupee,
  CalendarCheck,
  FileText,
  Check,
  Filter,
  Download,
} from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import type { Deposit } from "@/types";
import { formatDate } from "@/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MarkPaidButton } from "./MarkPaidButton";

interface SecurityDepositsPageProps {
  deposits: Deposit[];
}

type SecurityDepositStatus = "paid" | "unpaid";

export function SecurityDepositsPage({ deposits }: SecurityDepositsPageProps) {
  const [selectedDeposits, setSelectedDeposits] = useState<Set<string>>(
    new Set()
  );
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const normalizeStatus = (
    status: SecurityDepositStatus
  ): "paid" | "unpaid" => {
    return status === "paid" ? "paid" : "unpaid";
  };

  const [depositStatuses, setDepositStatuses] = useState<
    Record<string, "paid" | "unpaid">
  >(() => {
    const initialStatuses: Record<string, "paid" | "unpaid"> = {};
    deposits.forEach((deposit) => {
      initialStatuses[deposit.id] = normalizeStatus(deposit.paymentstatus);
    });
    return initialStatuses;
  });

  const fundTypes = Array.from(
    new Set(
      deposits
        .map(
          (d) =>
            d.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails
              ?.schemeName
        )
        .filter(Boolean)
    )
  );

  const filteredDeposits = deposits.filter((deposit) => {
    const fundMatch =
      selectedFund === "all" ||
      deposit.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails
        ?.schemeName === selectedFund;

    const currentStatus =
      depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "paid" && currentStatus === "paid") ||
      (statusFilter === "unpaid" && currentStatus === "unpaid");

    return fundMatch && statusMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateDaysRemaining = (maturityDate: Date | null) => {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate);
    if (isNaN(maturity.getTime())) return null;
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalDeposits = filteredDeposits.reduce(
    (acc, deposit) => acc + deposit.securityDepositAmt,
    0
  );

  let overdueCount = 0;
  let approachingCount = 0;
  let activeCount = 0;

  filteredDeposits.forEach((deposit) => {
    const daysRemaining = calculateDaysRemaining(deposit.maturityDate);
    if (daysRemaining === null) return;

    if (daysRemaining < 0) {
      overdueCount++;
    } else if (daysRemaining <= 7) {
      approachingCount++;
    } else {
      activeCount++;
    }
  });

  const toggleDepositSelection = (depositId: string) => {
    const newSelection = new Set(selectedDeposits);
    if (newSelection.has(depositId)) {
      newSelection.delete(depositId);
    } else {
      newSelection.add(depositId);
    }
    setSelectedDeposits(newSelection);
  };

  const toggleAllDeposits = () => {
    if (selectedDeposits.size === filteredDeposits.length) {
      setSelectedDeposits(new Set());
    } else {
      setSelectedDeposits(new Set(filteredDeposits.map((d) => d.id)));
    }
  };

  const markAsPaid = (depositId: string) => {
    setDepositStatuses((prev) => ({
      ...prev,
      [depositId]: "paid",
    }));
  };

  const markSelectedAsPaid = () => {
    const newStatuses = { ...depositStatuses };
    selectedDeposits.forEach((depositId) => {
      newStatuses[depositId] = "paid";
    });
    setDepositStatuses(newStatuses);
    setSelectedDeposits(new Set());
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Security Deposits Report", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("en-IN");
      const fundFilterText =
        selectedFund === "all" ? "All Fund Types" : selectedFund;
      const statusFilterText =
        statusFilter === "all" ? "All Statuses" : statusFilter;
      doc.text(
        `Generated on: ${currentDate} | Fund: ${fundFilterText} | Status: ${statusFilterText}`,
        pageWidth / 2,
        30,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 14, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Deposits: ${formatCurrency(totalDeposits)}`, 14, 52);
      doc.text(
        `Active: ${activeCount} | Approaching Maturity: ${approachingCount} | Overdue: ${overdueCount}`,
        14,
        59
      );

      const tableData = filteredDeposits.map((deposit, index) => {
        const paymentDetail = deposit.PaymentDetails?.[0];
        const worksDetails = paymentDetail?.WorksDetail;
        const nitDetails = worksDetails?.nitDetails;
        const bidAgency =
          worksDetails?.AwardofContract?.workorderdetails[0]?.Bidagency
            ?.agencydetails.name || "N/A";
        const daysRemaining = calculateDaysRemaining(deposit.maturityDate);
        const currentStatus =
          depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);

        return [
          index + 1,
          bidAgency,
          nitDetails?.memoNumber || "N/A",
          deposit.securityDepositAmt,
          deposit.maturityDate ? formatDate(deposit.maturityDate) : "N/A",
          daysRemaining === null ? "N/A" : `${daysRemaining} days`,
          currentStatus === "paid" ? "Paid" : "unpaid",
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Sl No",
            "Agency Name",
            "NIT Details",
            "Amount",
            "Maturity Date",
            "Days Remaining",
            "Status",
          ],
        ],
        body: tableData,
        startY: 70,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 15 },
          1: { halign: "left", cellWidth: 50 },
          2: { halign: "left", cellWidth: 35 },
          3: { halign: "right", cellWidth: 35 },
          4: { halign: "center", cellWidth: 30 },
          5: { halign: "center", cellWidth: 30 },
          6: { halign: "center", cellWidth: 25 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { top: 70, left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 6 && data.section === "body") {
            if (data.cell.text[0] === "Paid") {
              data.cell.styles.textColor = [34, 197, 94];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = "bold";
            }
          }

          if (data.column.index === 5 && data.section === "body") {
            const daysText = data.cell.text[0];
            if (daysText !== "N/A") {
              const days = Number.parseInt(daysText.split(" ")[0]);
              if (days < 0) {
                data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = "bold";
              } else if (days <= 7) {
                data.cell.styles.textColor = [245, 158, 11];
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        "© Security Deposits Management System",
        pageWidth / 2,
        finalY + 20,
        { align: "center" }
      );

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10,
          {
            align: "right",
          }
        );
      }

      const fileName = `security-deposits-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <IndianRupee className="h-7 w-7 text-blue-600" />
              Security Deposits Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage all security deposits in one place
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters and Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Filter className="h-4 w-4 text-gray-500" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Fund Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fund Type
                  </label>
                  <Select value={selectedFund} onValueChange={setSelectedFund}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select fund" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fund Types</SelectItem>
                      {fundTypes.map((fund) => (
                        <SelectItem key={fund} value={fund}>
                          {fund}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Deposits Card */}
            <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Deposits
                    </p>
                    <h3 className="text-xl font-bold mt-1">
                      {formatCurrency(totalDeposits)}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Deposits Card */}
            <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <h3 className="text-xl font-bold mt-1">{activeCount}</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <CalendarCheck className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approaching Maturity Card */}
            <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Approaching
                    </p>
                    <h3 className="text-xl font-bold mt-1">
                      {approachingCount}
                    </h3>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Deposits Card */}
            <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <h3 className="text-xl font-bold mt-1">{overdueCount}</h3>
                  </div>
                  <div className="bg-red-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDeposits.size > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedDeposits.size} deposit
                  {selectedDeposits.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  onClick={markSelectedAsPaid}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Mark Selected as Paid
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposits Table */}
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="border-b border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-800">
                Deposit Records
              </CardTitle>
              <div className="text-sm text-gray-500">
                Showing {filteredDeposits.length} deposits
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDeposits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Security Deposits Found
                </h3>
                <p className="text-gray-500 max-w-md">
                  No deposits match the selected filters. Try adjusting your
                  filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-12 px-4">
                        <Checkbox
                          checked={
                            selectedDeposits.size === filteredDeposits.length &&
                            filteredDeposits.length > 0
                          }
                          onCheckedChange={toggleAllDeposits}
                          aria-label="Select all deposits"
                        />
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        #
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        Agency
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        NIT Details
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        Maturity
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="px-4 font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.map((deposit, index) => {
                      if (
                        !deposit.PaymentDetails ||
                        deposit.PaymentDetails.length === 0
                      ) {
                        return null;
                      }

                      const daysRemaining = calculateDaysRemaining(
                        deposit.maturityDate
                      );
                      const isMaturityApproaching =
                        daysRemaining !== null &&
                        daysRemaining <= 7 &&
                        daysRemaining >= 0;
                      const isMaturityOverdue =
                        daysRemaining !== null && daysRemaining < 0;

                      const paymentDetail = deposit.PaymentDetails[0];
                      const worksDetails = paymentDetail.WorksDetail;
                      const nitDetails = worksDetails?.nitDetails;
                      const bidAgency =
                        worksDetails?.AwardofContract?.workorderdetails[0]
                          ?.Bidagency?.agencydetails.name;

                      const currentStatus =
                        depositStatuses[deposit.id] ||
                        normalizeStatus(deposit.paymentstatus);

                      return (
                        <TableRow
                          key={deposit.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="px-4 py-3">
                            <Checkbox
                              checked={selectedDeposits.has(deposit.id)}
                              onCheckedChange={() =>
                                toggleDepositSelection(deposit.id)
                              }
                              aria-label={`Select deposit ${index + 1}`}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium text-gray-900">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-4 py-3 max-w-[200px] truncate">
                            {bidAgency}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {nitDetails && (
                              <ShowNitDetails
                                nitdetails={nitDetails.memoNumber}
                                memoDate={nitDetails.memoDate}
                                workslno={worksDetails?.workslno || ""}
                              />
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-semibold text-right text-gray-900">
                            {formatCurrency(deposit.securityDepositAmt)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {deposit.maturityDate
                                  ? formatDate(deposit.maturityDate)
                                  : "N/A"}
                              </span>
                              <span
                                className={`text-xs ${
                                  daysRemaining !== null && daysRemaining < 0
                                    ? "text-red-600 font-medium"
                                    : daysRemaining !== null &&
                                      daysRemaining <= 7
                                    ? "text-amber-600 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {daysRemaining === null
                                  ? ""
                                  : `${daysRemaining} days remaining`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              variant={
                                currentStatus === "paid"
                                  ? "default"
                                  : "destructive"
                              }
                              className="rounded-md px-2.5 py-1 text-xs font-medium"
                            >
                              {currentStatus === "paid" ? "Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {currentStatus === "unpaid" && (
                              <MarkPaidButton depositId={deposit.id} />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
