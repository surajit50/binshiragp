"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import WorksTable from "./WorksTable";
import { IndianRupee } from "lucide-react";

interface WorkItem {
  id: string;
  nitDetails: {
    id: string;
    memoDate: Date;
    memoNumber: number;
    isSupply: boolean;
    supplyitemname: string | null;
    publishingDate: Date;
    documentDownloadFrom: Date;
    startTime: Date;
    updatedAt: Date;
  };
  workslno: number;
  paymentDetails: Array<{
    grossBillAmount: number;
    billType: string;
  }>;
  ApprovedActionPlanDetails: {
    activityCode: number;
    activityDescription: string;
    schemeName: string;
  } | null;
  AwardofContract: {
    workorderdetails: Array<{
      Bidagency: {
        agencydetails: {
          name: string;
        };
      } | null;
    }>;
  } | null;
  workStatus: string;
  finalEstimateAmount: string;
  totalPaid: number;
  pending: number;
  financialYear: string;
  formattedNit: string;
}

interface WorksTabsProps {
  works: WorkItem[];
}

export default function WorksTabs({ works }: WorksTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";

  // Process works data to calculate paid/pending status
  const processedWorks = works.map((work) => {
    const totalPaid = work.paymentDetails.reduce(
      (sum, payment) => sum + (payment.grossBillAmount || 0),
      0
    );
    const estimatedCost = Number(work.finalEstimateAmount) || 0;
    const hasFinalBill = work.paymentDetails.some((p) =>
      p.billType.toLowerCase().includes("final bill")
    );
    const pending = hasFinalBill ? 0 : estimatedCost - totalPaid;

    return {
      ...work,
      totalPaid,
      pending,
      isPaid: pending === 0 || hasFinalBill,
    };
  });

  // Filter works based on tab
  const filteredWorks = processedWorks.filter((work) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !work.isPaid && work.pending > 0;
    if (activeTab === "paid") return work.isPaid || work.pending === 0;
    return true;
  });

  // Calculate summary
  const summary = filteredWorks.reduce(
    (acc, work) => {
      const memo = work.nitDetails.memoNumber.toString();
      if (!acc[memo]) {
        acc[memo] = {
          totalPaid: 0,
          totalPending: 0,
          nitDate: work.nitDetails.memoDate,
          financialYear: work.financialYear,
          formattedNit: work.formattedNit,
        };
      }
      acc[memo].totalPaid += work.totalPaid;
      acc[memo].totalPending += work.pending;
      return acc;
    },
    {} as Record<
      string,
      {
        totalPaid: number;
        totalPending: number;
        nitDate: Date;
        financialYear: string;
        formattedNit: string;
      }
    >
  );

  // Grand totals
  const nitEntries = Object.entries(summary);
  const grandTotalPaid = nitEntries.reduce(
    (sum, [, data]) => sum + data.totalPaid,
    0
  );
  const grandTotalPending = nitEntries.reduce(
    (sum, [, data]) => sum + data.totalPending,
    0
  );

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  // Empty state
  if (filteredWorks.length === 0) {
    return (
      <div>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
              <IndianRupee className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Works Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your filters or check back later for new entries.
            </p>
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="paid">Paid</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>

      <TabsContent value="pending" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>

      <TabsContent value="paid" className="space-y-6">
        <WorksTable works={filteredWorks} />
      </TabsContent>
    </Tabs>
  );
}
