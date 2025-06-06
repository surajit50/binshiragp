
"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { renewWarishApplication } from "@/action/renew-warish-application";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/utils";

export type WarishApplication = {
  id: string;
  applicantName: string;
  warishRefNo?: string | null;
  warishRefDate?: Date | null;
  renewdate?: Date | null;
  approvalYear?: string | null;
};

const RenewButton = ({ id }: { id: string }) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const result = await renewWarishApplication(id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to renew application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRenewing(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirmation(true)}
        disabled={isRenewing}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        {isRenewing ? "Renewing..." : "Renew"}
      </Button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Renewal</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to renew this application? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenew}
                disabled={isRenewing}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isRenewing ? "Processing..." : "Confirm Renewal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const columns: ColumnDef<WarishApplication>[] = [
  {
    accessorKey: "applicantName",
    header: "Applicant Name",
  },
  {
    accessorKey: "warishRefNo",
    header: "Warish Ref No",
    cell: ({ row }) => row.original.warishRefNo || "N/A",
  },
  {
    accessorKey: "warishRefDate",
    header: "Warish Ref Date",
    cell: ({ row }) =>
      row.original.warishRefDate
        ? formatDate(row.original.warishRefDate)
        : "N/A",
  },
  {
    accessorKey: "renewdate",
    header: "Renewal Date",
    cell: ({ row }) =>
      row.original.renewdate
        ? formatDate(row.original.renewdate)
        : "N/A",
  },
  {
    accessorKey: "approvalYear",
    header: "Approval Year",
    cell: ({ row }) => row.original.approvalYear || "N/A",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const isOverdue =
        row.original.renewdate && row.original.renewdate < today;
      const isDifferentYear =
        row.original.approvalYear !== undefined &&
        row.original.approvalYear !== currentYear;

      if (isOverdue && isDifferentYear) {
        return (
          <span className="text-red-500 font-semibold">
            Overdue & Different Year
          </span>
        );
      } else if (isOverdue) {
        return <span className="text-orange-500 font-semibold">Overdue</span>;
      } else if (isDifferentYear) {
        return (
          <span className="text-yellow-500 font-semibold">Different Year</span>
        );
      } else {
        return <span className="text-green-500 font-semibold">Up to Date</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RenewButton id={row.original.id} />,
  },
];
