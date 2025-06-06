import type { Gender, LivingStatus, MaritialStatus, FamilyRelationship } from "@prisma/client"

export type WarishDetailType = {
  id: string
  name: string
  gender: Gender
  relation: FamilyRelationship
  livingStatus: LivingStatus
  maritialStatus: MaritialStatus
  hasbandName: string | null
  parentId: string | null
  warishApplicationId: string
  createdAt: Date
  updatedAt: Date
  children: WarishDetailType[]
}
