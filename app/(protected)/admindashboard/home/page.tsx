import { db } from "@/lib/db";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/utils";
import { ShowWarishDetails } from "@/components/ShowWarishDetails";
import SummaryCard from "@/components/SummaryCard";
async function getLatestWarishApplications() {
  try {
    const applications = await db.warishApplication.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        warishDetails: true,
      },
    });
    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  const applications = await getLatestWarishApplications();

  return (
    <div className="flex">
      <div>
        <h1 className="text-2xl font-bold">Latest Warish Applications</h1>

        <div className="rounded-lg border shadow-sm bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-4 py-3">Acknowledgement No</TableHead>
                <TableHead className="px-4 py-3">Deceased</TableHead>
                <TableHead className="px-4 py-3">Legal Heirs (Top 3)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 py-3 font-medium">
                    {app.acknowlegment}
                    <div className="text-sm text-muted-foreground mt-1">
                      Ref: {app.warishRefNo || "N/A"}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="font-semibold">{app.nameOfDeceased}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>DOD: {formatDate(app.dateOfDeath)}</p>
                        <p>Relation: {app.relationwithdeceased}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <ShowWarishDetails warishapplicationid={app.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 
