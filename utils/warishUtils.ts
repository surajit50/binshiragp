import { FamilyRelationship } from "@prisma/client";
import type { WarishDetailType } from "@/types/warish";

// Create a map of warish details with id as key
export function createWarishDetailsMap(
  warishDetails: WarishDetailType[]
): Map<string, WarishDetailType> {
  const warishDetailsMap = new Map<string, WarishDetailType>();

  for (const detail of warishDetails) {
    warishDetailsMap.set(detail.id, detail);
  }

  return warishDetailsMap;
}

// Organize warish details into a hierarchy
export function organizeWarishDetailsHierarchy(
  warishDetailsMap: Map<string, WarishDetailType>
): WarishDetailType[] {
  const rootWarishDetails: WarishDetailType[] = [];

  // First pass: identify root nodes (those without parents or with non-existent parents)
  warishDetailsMap.forEach((detail) => {
    if (!detail.parentId || !warishDetailsMap.has(detail.parentId)) {
      rootWarishDetails.push(detail);
    }
  });

  // Second pass: build the hierarchy
  warishDetailsMap.forEach((detail) => {
    if (detail.parentId && warishDetailsMap.has(detail.parentId)) {
      const parent = warishDetailsMap.get(detail.parentId);
      if (parent) {
        parent.children.push(detail);
      }
    }
  });

  return rootWarishDetails;
}

// Validate family relationship
export function validateRelation(relation: string): FamilyRelationship {
  if (
    !Object.values(FamilyRelationship).includes(relation as FamilyRelationship)
  ) {
    throw new Error(`Invalid family relationship: ${relation}`);
  }
  return relation as FamilyRelationship;
}
