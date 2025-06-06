'use server'

import { db } from "@/lib/db";
import { ActionPlanDetailsProps, actionplanschema } from "@/schema/actionplan";
import { ApprovedActionPlanDetails, Prisma } from "@prisma/client";
import { z } from "zod";

interface FetchApprovedActionPlansResult {
  plans: ApprovedActionPlanDetails[]
  totalCount: number
  hasMore: boolean
}

export async function fetchApprovedActionPlans(
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = ''
): Promise<FetchApprovedActionPlansResult> {
  try {
    const skip = (page - 1) * pageSize
    const where: Prisma.ApprovedActionPlanDetailsWhereInput = searchTerm
  ? {
      isPublish: false,
      OR: [
        { activityName: { contains: searchTerm, mode: 'insensitive' } },
        { activityDescription: { contains: searchTerm, mode: 'insensitive' } },
        { schemeName: { contains: searchTerm, mode: 'insensitive' } },
        { activityCode: { equals: parseInt(searchTerm) || undefined } },
      ],
    }
  : { isPublish: false };

    const [plans, totalCount] = await Promise.all([
      db.approvedActionPlanDetails.findMany({
        where,
        orderBy: { activityCode: 'asc' },
        skip,
        take: pageSize,
      }),
      db.approvedActionPlanDetails.count({ where }),
    ])

    const hasMore = totalCount > skip + plans.length

    return {
      plans,
      totalCount,
      hasMore,
    }
  } catch (error) {
    console.error('Error fetching approved action plans:', error)
    throw new Error('Failed to fetch approved action plans')
  }
}

 


export const updateActionPlan = async (
  id: string,
  data: z.infer<typeof actionplanschema>
) => {
  try {
    const action = await db.approvedActionPlanDetails.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
    return { success: true, message: "Action Plan Updated Successfully" };
  } catch (error) {
    return { success: false, message: "Failed to Update Action Plan" };
  }
};
