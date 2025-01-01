import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Base schema for common staff properties
const StaffBaseSchema = z.object({
  id: z.number(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  contactNumber: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  address: z.string(),
  employeeId: z.string(),
  department: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Doctor-specific schema
export const DoctorSchema = StaffBaseSchema.extend({
  role: z.literal("doctor"),
  specialization: z.string(),
  licenseNumber: z.string(),
  availability: z.array(
    z.object({
      day: z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

// Nurse-specific schema
export const NurseSchema = StaffBaseSchema.extend({
  role: z.literal("nurse"),
  shift: z.enum(["morning", "afternoon", "night"]),
  certificationNumber: z.string(),
});

// Administrative staff schema
export const AdminStaffSchema = StaffBaseSchema.extend({
  role: z.literal("admin"),
  position: z.enum([
    "hospital_manager",
    "resource_coordinator",
    "system_administrator",
    "finance_manager",
    "hr_manager",
  ]),
  accessLevel: z.enum(["basic", "intermediate", "full"]),
  responsibilities: z.array(z.string()),
  managedDepartments: z.array(z.string()).optional(),
});

// Add emergency team specific enums
const EmergencyRoleEnum = z.enum([
  "emergency_physician",
  "trauma_surgeon",
  "emergency_nurse",
  "paramedic",
  "triage_coordinator",
]);

const TriageLevelEnum = z.enum([
  "level1_resuscitation",
  "level2_emergent",
  "level3_urgent",
  "level4_less_urgent",
  "level5_non_urgent",
]);

// Add emergency team schema
export const EmergencyTeamMemberSchema = StaffBaseSchema.extend({
  role: z.literal("emergency"),
  emergencyRole: EmergencyRoleEnum,
  specializedTraining: z.array(z.string()),
  certifications: z.array(z.string()),
  triageAccess: z.array(TriageLevelEnum),
  activeShift: z.boolean(),
  lastEmergencyResponse: z.date().optional(),
  responseTeamId: z.string().optional(),
});

// Add lab test specific enums
export const LabTestTypeEnum = z.enum([
  "blood_work",
  "urinalysis",
  "imaging",
  "biopsy",
  "microbiology",
  "genetic_testing",
  "toxicology",
]);

export const LabTestStatusEnum = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "pending_review",
]);

// Add lab technician schema
export const LabTechnicianSchema = StaffBaseSchema.extend({
  role: z.literal("lab_technician"),
  specialization: z.array(LabTestTypeEnum),
  certifications: z.array(z.string()),
  labId: z.string(),
  activeShift: z.boolean(),
  equipmentQualifications: z.array(z.string()),
});

// Combined type for any medical staff
export const MedicalStaffSchema = z.discriminatedUnion("role", [
  DoctorSchema,
  NurseSchema,
  AdminStaffSchema,
  EmergencyTeamMemberSchema,
  LabTechnicianSchema,
]);

// Types
export type Doctor = z.infer<typeof DoctorSchema>;
export type Nurse = z.infer<typeof NurseSchema>;
export type MedicalStaff = z.infer<typeof MedicalStaffSchema>;

// Create schemas (omitting auto-generated fields)
export const CreateDoctorSchema = DoctorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateNurseSchema = NurseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Get by ID schema
export const GetStaffSchema = z.object({
  params: z.object({ id: z.string() }),
});

// Add Admin type
export type AdminStaff = z.infer<typeof AdminStaffSchema>;

// Create schema for admin staff
export const CreateAdminStaffSchema = AdminStaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add type
export type EmergencyTeamMember = z.infer<typeof EmergencyTeamMemberSchema>;

// Create schema for emergency team member
export const CreateEmergencyTeamMemberSchema = EmergencyTeamMemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add emergency case schema
export const EmergencyCaseSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  triageLevel: TriageLevelEnum,
  description: z.string(),
  assignedTeamMembers: z.array(z.number()), // staff IDs
  status: z.enum(["pending", "in_progress", "resolved", "transferred"]),
  requiredResources: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
});

export type EmergencyCase = z.infer<typeof EmergencyCaseSchema>;

// Create schema for emergency case
export const CreateEmergencyCaseSchema = EmergencyCaseSchema.omit({
  id: true,
  assignedTeamMembers: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

// Add lab test schema
export const LabTestSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  requestedById: z.number(), // ID of the doctor who requested the test
  technicianId: z.number().optional(), // ID of assigned lab technician
  type: LabTestTypeEnum,
  status: LabTestStatusEnum,
  priority: z.enum(["routine", "urgent", "stat"]),
  scheduledDate: z.date(),
  completedDate: z.date().optional(),
  results: z
    .object({
      data: z.record(z.string(), z.any()),
      notes: z.string().optional(),
      attachments: z.array(z.string()).optional(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Add types
export type LabTechnician = z.infer<typeof LabTechnicianSchema>;
export type LabTest = z.infer<typeof LabTestSchema>;

// Create schemas
export const CreateLabTechnicianSchema = LabTechnicianSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateLabTestSchema = LabTestSchema.omit({
  id: true,
  technicianId: true,
  status: true,
  completedDate: true,
  results: true,
  createdAt: true,
  updatedAt: true,
});

// Add this with your other schemas
export const DoctorScheduleSchema = z.object({
  doctorId: z.number(),
  date: z.string(),
  timeSlots: z.array(
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
      appointmentId: z.number().optional(),
    })
  ),
});

// Add this with your other type exports
export type DoctorSchedule = z.infer<typeof DoctorScheduleSchema>;
