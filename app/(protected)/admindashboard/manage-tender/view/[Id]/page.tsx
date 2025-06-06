import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// This would typically be in a separate file
type NitDetails = {
  id: string;
  memoNumber: number;
  memoDate: Date;
  isSupply: boolean;
  publishingDate: Date;
  documentDownloadFrom: Date;
  startTime: Date;
  endTime: Date;
  technicalBidOpeningDate: Date;
  financialBidOpeningDate: Date | null;
  placeOfOpeningBids: string;
  bidValidity: number;
  isPublished: boolean;
};

// This function would typically be in a separate file, e.g., lib/api.ts
async function getNITDetails(id: string): Promise<NitDetails | null> {
  // In a real application, this would be an API call or database query
  // For demonstration, we're returning mock data
  const mockNIT: NitDetails = {
    id,
    memoNumber: 123456,
    memoDate: new Date(),
    isSupply: false,
    publishingDate: new Date(),
    documentDownloadFrom: new Date(),
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    technicalBidOpeningDate: new Date(Date.now() + 86400000),
    financialBidOpeningDate: new Date(Date.now() + 172800000),
    placeOfOpeningBids: "Conference Room A",
    bidValidity: 90,
    isPublished: true,
  };

  return mockNIT;
}

export default async function NITDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const nit = await getNITDetails(params.id);

  if (!nit) {
    notFound();
  }

  const formatDate = (date: Date) => format(date, "PPP");
  const formatDateTime = (date: Date) => format(date, "PPP p");

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            <span>NIT Details: {nit.memoNumber}</span>
            <div className="flex space-x-2">
              <Badge variant={nit.isPublished ? "success" : "secondary"}>
                {nit.isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant={nit.isSupply ? "default" : "outline"}>
                {nit.isSupply ? "Supply" : "Works"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <p>
                <span className="font-medium">Memo Number:</span>{" "}
                {nit.memoNumber}
              </p>
              <p>
                <span className="font-medium">Memo Date:</span>{" "}
                {formatDate(nit.memoDate)}
              </p>
              <p>
                <span className="font-medium">Publishing Date:</span>{" "}
                {formatDate(nit.publishingDate)}
              </p>
              <p>
                <span className="font-medium">Bid Validity:</span>{" "}
                {nit.bidValidity} days
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Download</h3>
              <p>
                <span className="font-medium">From:</span>{" "}
                {formatDateTime(nit.documentDownloadFrom)}
              </p>
              <p>
                <span className="font-medium">Start Time:</span>{" "}
                {format(nit.startTime, "p")}
              </p>
              <p>
                <span className="font-medium">End Time:</span>{" "}
                {format(nit.endTime, "p")}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Bid Opening</h3>
              <p>
                <span className="font-medium">Technical Bid:</span>{" "}
                {formatDateTime(nit.technicalBidOpeningDate)}
              </p>
              {nit.financialBidOpeningDate && (
                <p>
                  <span className="font-medium">Financial Bid:</span>{" "}
                  {formatDateTime(nit.financialBidOpeningDate)}
                </p>
              )}
              <p>
                <span className="font-medium">Place of Opening:</span>{" "}
                {nit.placeOfOpeningBids}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
