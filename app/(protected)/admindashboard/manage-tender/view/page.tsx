import React from "react";
import { db } from "@/lib/db";
import { formatDateTime } from "@/utils/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Trash2, AlertCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NITCopy } from "@/components/PrintTemplet/PrintNIt-copy";
import { deleteNitAction } from "@/action/bookNitNuber";

async function getNITs() {
  try {
    return await db.nitDetails.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        WorksDetail: {
          include: { ApprovedActionPlanDetails: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch NITs:", error);
    return [];
  }
}

export default async function DemoPage() {
  const existnit = await getNITs();

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full shadow-sm border-0">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                Manage NITs
              </CardTitle>
              <p className="text-sm text-gray-500">
                Create and manage tender notices efficiently
              </p>
            </div>
            <Link href="/admindashboard/manage-tender/create" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New NIT
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {existnit && existnit.length > 0 ? (
            <div className="space-y-4">
              {existnit.map((nit, index) => {
                const nitYear = new Date(nit.memoDate).getFullYear();
                return (
                  <div
                    key={nit.id}
                    className="group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div className="text-gray-500 font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <Link
                          href={`/admindashboard/manage-tender/view/${nit.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {nit.memoNumber}/DGP/{nitYear}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(nit.memoDate).dateOnly}
                        </p>
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={`text-sm ${
                            nit.isPublished
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-orange-200 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {nit.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <span className="font-medium">
                          {nit.WorksDetail.length || "0"}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          works
                        </span>
                      </div>
                      <div className="flex justify-end items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:bg-gray-100"
                                asChild
                              >
                                <Link
                                  href={`/admindashboard/manage-tender/view/${nit.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {!nit.isPublished && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:bg-blue-50"
                                  asChild
                                >
                                  <Link
                                    href={`/admindashboard/manage-tender/add/${nit.id}`}
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add Work</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {nit.WorksDetail.length === 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deleteNitAction(nit.id);
                                  }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    type="submit"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </form>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete NIT</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <NITCopy nitdetails={nit} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="inline-block bg-blue-50 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                No NITs Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Get started by creating a new NIT to manage your tender
                processes efficiently.
              </p>
              <div className="pt-6">
                <Link href="/admindashboard/manage-tender/create" passHref>
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New NIT
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
