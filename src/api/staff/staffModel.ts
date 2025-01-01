import { z } from "@/common/utils/zodExtensions";

// Base schema for all staff members
export const StaffBaseSchema = z.object({
  id: z.string(),
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

// Doctor-specific schemas
export const DoctorAvailabilitySchema = z.object({
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
});

export const DoctorSchema = StaffBaseSchema.extend({
  role: z.literal("doctor"),
  specialization: z.string(),
  availability: z.array(DoctorAvailabilitySchema),
  licenseNumber: z.string(),
});

// Nurse-specific schema
export const NurseSchema = StaffBaseSchema.extend({
  role: z.literal("nurse"),
  shift: z.enum(["morning", "afternoon", "night"]),
  certificationNumber: z.string(),
});

// Admin staff schema
export const AdminStaffSchema = StaffBaseSchema.extend({
  role: z.literal("admin"),
  accessLevel: z.enum(["full", "restricted", "readonly"]),
  managedDepartments: z.array(z.string()),
  responsibilities: z.array(z.string()),
});

// Emergency team schema
export const EmergencyRoleEnum = z.enum([
  "team_lead",
  "first_responder",
  "trauma_specialist",
  "emergency_nurse",
]);

export const TriageLevelEnum = z.enum([
  "level1_resuscitation",
  "level2_emergent",
  "level3_urgent",
  "level4_less_urgent",
  "level5_non_urgent",
]);

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

// Lab technician schema
export const LabTestTypeEnum = z.enum([
  "blood_work",
  "urinalysis",
  "imaging",
  "biopsy",
  "microbiology",
  "genetic_testing",
  "toxicology",
]);

export const LabTechnicianSchema = StaffBaseSchema.extend({
  role: z.literal("lab_technician"),
  specialization: z.array(LabTestTypeEnum),
  certifications: z.array(z.string()),
  activeShift: z.boolean(),
});

// Lab Test schema
export const LabTestStatusEnum = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const LabTestSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  technicianId: z.string(),
  testType: LabTestTypeEnum,
  status: LabTestStatusEnum,
  priority: z.enum(["routine", "urgent", "stat"]),
  requestedBy: z.string(),
  notes: z.string().optional(),
  results: z.string().optional(),
  scheduledDate: z.date(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schemas
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

// Union type for all medical staff
export const MedicalStaffSchema = z.discriminatedUnion("role", [
  DoctorSchema,
  NurseSchema,
  AdminStaffSchema,
  EmergencyTeamMemberSchema,
  LabTechnicianSchema,
]);

// Add with other schemas
export const ExaminationSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  scheduledDate: z.date(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  completedAt: z.date().optional(),
  cancelReason: z.string().optional(),
  followUpDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Add with other create schemas
export const CreateLabTestSchema = LabTestSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  results: true,
});

export const CreateAdminStaffSchema = AdminStaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateEmergencyTeamMemberSchema = EmergencyTeamMemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateLabTechnicianSchema = LabTechnicianSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const GetStaffSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const DoctorScheduleSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  timeSlots: z.array(
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
      appointmentId: z.string().optional(),
    })
  ),
});

// Add with other schemas
export const EmergencyCaseSchema = z.object({
  _id: z.string(),
  patientId: z.string(),
  teamId: z.string(),
  severity: TriageLevelEnum,
  status: z.enum(["active", "resolved", "transferred"]),
  description: z.string(),
  vitalSigns: z.record(z.string(), z.any()),
  treatments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
});

export const CreateEmergencyCaseSchema = EmergencyCaseSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

// Type exports
export type Doctor = z.infer<typeof DoctorSchema>;
export type Nurse = z.infer<typeof NurseSchema>;
export type AdminStaff = z.infer<typeof AdminStaffSchema>;
export type EmergencyTeamMember = z.infer<typeof EmergencyTeamMemberSchema>;
export type LabTechnician = z.infer<typeof LabTechnicianSchema>;
export type MedicalStaff = z.infer<typeof MedicalStaffSchema>;
export type LabTest = z.infer<typeof LabTestSchema>;
export type Examination = z.infer<typeof ExaminationSchema>;
export type DoctorSchedule = z.infer<typeof DoctorScheduleSchema>;
export type EmergencyCase = z.infer<typeof EmergencyCaseSchema>;
