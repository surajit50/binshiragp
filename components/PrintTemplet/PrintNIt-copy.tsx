"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer } from "lucide-react";
import { generatePDF } from "../pdfgeneratortwo";
import { fetchnitdetailsType } from "@/types/nitDetails";
import { tendertermcon } from "@/constants";
import { formatDate } from "@/utils/utils";

const templatePath = "/templates/nitsamplecopy.json";

export const NITCopy = ({
  nitdetails,
}: {
  nitdetails: fetchnitdetailsType;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const workItems = nitdetails.WorksDetail.map((work, i) => [
        (i + 1).toString(),
        `${work.ApprovedActionPlanDetails?.activityDescription}-${work.ApprovedActionPlanDetails?.activityCode}`,
        work.ApprovedActionPlanDetails?.schemeName || "N/A",
        work.finalEstimateAmount.toFixed(2),
        work.participationFee.toFixed(2),
        (work.finalEstimateAmount * 0.02).toFixed(2),
        (work.finalEstimateAmount * 0.6).toFixed(2),
        "30 days",
      ]);

      const input = {
        field4: `(E-Procurement- ${nitdetails.nitCount})`,
        memono1: `Memo No: ${
          nitdetails.memoNumber
        }/DGP/${nitdetails.memoDate.getFullYear()}`,
        memono2: `Memo No: ${
          nitdetails.memoNumber
        }/DGP/${nitdetails.memoDate.getFullYear()}`,
        memoDate1: `Date: ${formatDate(nitdetails.memoDate)}`,
        memoDate2: `Date: ${formatDate(nitdetails.memoDate)}`,
        worklist: workItems,
        elegible:
          tendertermcon[0].eligible.map((term, i) => [`${i + 1}. ${term}`]) ||
          [],
        qualify:
          tendertermcon[0].qualidyceteria.map((term, i) => [
            `${i + 1}. ${term}`,
          ]) || [],
        termcondition:
          tendertermcon[0].termcondition.map((term, i) => [
            `${i + 1}. ${term}`,
          ]) || [],
        timetable: [
          [
            "Tender Publishing Date",
            nitdetails.publishingDate.toLocaleString(),
          ],
          ["Bid Submission Start Date", nitdetails.startTime.toLocaleString()],
          ["Bid Submission End Date", nitdetails.endTime.toLocaleString()],
          [
            "Technical Bid Opening Date",
            nitdetails.technicalBidOpeningDate.toLocaleString(),
          ],
          ["Financial Bid Opening Date", "To be Notified later on"],
          [
            "Place of Opening Bids",
            "Office of The Pradhan, DHALPARA Gram Panchayat.",
          ],
          ["Validity of Bids", "120 days"],
        ],
      };

      const pdf = await generatePDF(templatePath, [input]);
      const blob = new Blob([new Uint8Array(pdf.buffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NIT_${nitdetails.nitCount}_${formatDate(
        new Date()
      )}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "NIT Copy PDF generated successfully",
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
