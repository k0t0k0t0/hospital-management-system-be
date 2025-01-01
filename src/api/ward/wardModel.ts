import { z } from "@/common/utils/zodExtensions";

export const WardTypeEnum = z.enum([
  "general",
  "intensive_care",
  "emergency",
  "pediatric",
  "maternity",
  "surgery",
  "psychiatric",
  "isolation",
]);

export const BedStatusEnum = z.enum([
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "cleaning",
]);

export const ResourceTypeEnum = z.enum([
  "medical_equipment",
  "medication",
  "supplies",
  "staff",
]);

export const BedSchema = z.object({
  id: z.number(),
  wardId: z.number(),
  number: z.string(),
  status: BedStatusEnum,
  currentPatientId: z.number().optional(),
  lastOccupiedAt: z.date().optional(),
  lastCleanedAt: z.date(),
  notes: z.string().optional(),
  features: z.array(z.string()).optional(), // e.g., ["oxygen_supply", "call_button"]
});

export const WardResourceSchema = z.object({
  id: z.number(),
  wardId: z.number(),
  type: ResourceTypeEnum,
  name: z.string(),
  quantity: z.number(),
  minimumRequired: z.number(),
  lastRestockedAt: z.date(),
  notes: z.string().optional(),
});

export const WardSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: WardTypeEnum,
  floor: z.number(),
  capacity: z.number(),
  currentOccupancy: z.number(),
  assignedStaff: z.array(z.number()), // staff IDs
  resources: z.array(WardResourceSchema),
  status: z.enum(["active", "maintenance", "closed"]),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PatientAssignmentSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  wardId: z.number(),
  bedId: z.number(),
  assignedBy: z.number(), // staff ID
  assignedAt: z.date(),
  expectedDuration: z.number().optional(), // in days
  dischargeDate: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "discharged", "transferred"]),
});

// Types
export type Bed = z.infer<typeof BedSchema>;
export type Ward = z.infer<typeof WardSchema>;
export type WardResource = z.infer<typeof WardResourceSchema>;
export type PatientAssignment = z.infer<typeof PatientAssignmentSchema>;

// Create schemas
export const CreateWardSchema = WardSchema.omit({
  id: true,
  currentOccupancy: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateBedSchema = BedSchema.omit({
  id: true,
  status: true,
  currentPatientId: true,
  lastOccupiedAt: true,
});

export const CreatePatientAssignmentSchema = PatientAssignmentSchema.omit({
  id: true,
  assignedAt: true,
  dischargeDate: true,
  status: true,
});

export const UpdateWardResourceSchema = WardResourceSchema.omit({
  id: true,
  wardId: true,
});
