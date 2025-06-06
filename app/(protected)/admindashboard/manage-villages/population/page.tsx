import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Population from "@/components/Population";

export default async function AddPopulationPage() {
  const mouzaDetails = await db.mouzaname.findMany({
    include: {
      population: true,
    },
  });

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">
          Population Details
        </h1>
        <Population villages={mouzaDetails} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[60px] font-semibold text-gray-600">
                Sl No
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Mouza Name
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                JL No
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Total Population
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Male
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Female
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Other
              </TableHead>
              <TableHead className="font-semibold text-gray-600">ST</TableHead>
              <TableHead className="font-semibold text-gray-600">SC</TableHead>
              <TableHead className="font-semibold text-gray-600">
                Minority
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mouzaDetails.map((mouza, index) => {
              const population = mouza.population || {
                male: 0,
                female: 0,
                other: 0,
                st: 0,
                sc: 0,
                minority: 0,
              };
              const totalPopulation =
                population.male + population.female + population.other;
              return (
                <TableRow key={mouza.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-700">{mouza.name}</TableCell>
                  <TableCell className="text-gray-700">{mouza.jlno}</TableCell>
                  <TableCell className="text-gray-700">
                    {totalPopulation}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.male}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.female}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.other}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.st}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.sc}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {population.other}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-100"
                      aria-label={`Edit ${mouza.name}`}
                    ></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
