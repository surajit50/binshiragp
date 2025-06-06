
"use client";

import Link from "next/link";
import { Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WorkDetailsListProps {
  workDetails: {
    id: string;
    
    WorksDetail: Array<{
      id: string;
      finalEstimateAmount:number;
      ApprovedActionPlanDetails: {
        id: string;
        financialYear: string;
        themeName: string;
        activityCode: number;
        activityName: string;
        activityDescription: string;
        activityFor: string;
        sector: string;
        isPublish: boolean;
        estimatedCost: number;
      };
    }>;
  };
}

export default function WorkDetailsList(
  { workDetails }: WorkDetailsListProps = {
    workDetails: { id: "1", WorksDetail: [] },
  }
) {
  if (workDetails.WorksDetail.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No work details found.</p>
        </CardContent>
      </Card>
    );
  }

  const allWorkPublished = workDetails.WorksDetail.every(
    (work) => work.ApprovedActionPlanDetails.isPublish
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="py-6">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {workDetails.WorksDetail.map((item, index) => (
            <AccordionItem key={item.id} value={item.id} className="border rounded-lg">
              <AccordionTrigger className="hover:no-underline px-4 hover:bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-4 w-full">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 text-left">
                    <div className="flex gap-1">
                   
                    <p className="font-medium">
                      Activity Code:{" "}
                      {item.ApprovedActionPlanDetails.activityCode}
                    </p>
                      <p>Estimage Cost:{item.finalEstimateAmount}</p>
                      </div>
                    <p className="text-sm text-gray-500 truncate">
                      {item.ApprovedActionPlanDetails.activityName}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 bg-gray-50 rounded-b-lg">
                <div className="pl-12 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Theme</p>
                      <p>{item.ApprovedActionPlanDetails.themeName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Financial Year</p>
                      <p>{item.ApprovedActionPlanDetails.financialYear}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Activity For</p>
                      <p>{item.ApprovedActionPlanDetails.activityFor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600"> estimatedCost </p>
                      <p>{item.ApprovedActionPlanDetails.estimatedCost}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-gray-700">
                      {item.ApprovedActionPlanDetails.activityDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge variant={item.ApprovedActionPlanDetails.isPublish ? "default" : "destructive"}>
                      {item.ApprovedActionPlanDetails.isPublish ? "Published" : "Not Published"}
                    </Badge>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>

      <CardFooter className="flex justify-end p-4 border-t">
        {allWorkPublished && (
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
