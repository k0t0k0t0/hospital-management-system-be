import { z } from "@/common/utils/zodExtensions";

// Base schema for all staff members
export const StaffBaseSchema = z.object({
  id: z.string({ required_error: "Staff ID is required" }),
  firstName: z.string({ required_error: "First name is required" }).min(2),
  lastName: z.string({ required_error: "Last name is required" }).min(2),
  email: z.string({ required_error: "Email is required" }).email(),
  password: z.string({ required_error: "Password is required" }).min(6),
  contactNumber: z.string({ required_error: "Contact number is required" }),
  dateOfBirth: z.string({ required_error: "Date of birth is required" }).date(),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
  }),
  address: z.string({ required_error: "Address is required" }),
  employeeId: z.string({ required_error: "Employee ID is required" }),
  department: z.string({ required_error: "Department is required" }),
  createdAt: z.date({ required_error: "Created date is required" }),
  updatedAt: z.date({ required_error: "Updated date is required" }),
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
  position: z.enum([
    "hospital_manager",
    "resource_coordinator",
    "system_administrator",
    "finance_manager",
    "hr_manager",
  ]),
});

// Emergency team schema
export const EmergencyRoleEnum = z.enum([
  "team_lead",
  "emergency_physician",
  "trauma_surgeon",
  "emergency_nurse",
  "paramedic",
  "triage_coordinator",
  "ambulance_driver",
  "ambulance_technician",
  "ambulance_attendant",
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
  _id: z.string({ required_error: "Lab test ID is required" }),
  patientId: z.string({ required_error: "Patient ID is required" }),
  technicianId: z.string({ required_error: "Technician ID is required" }),
  testType: LabTestTypeEnum.describe("Test type is required"),
  status: LabTestStatusEnum.describe("Test status is required"),
  priority: z.enum(["routine", "urgent", "stat"], {
    required_error: "Priority is required",
  }),
  requestedBy: z.string({ required_error: "Requester ID is required" }),
  notes: z.string().optional(),
  results: z.string().optional(),
  scheduledDate: z.date({ required_error: "Scheduled date is required" }),
  completedAt: z.date().optional(),
  createdAt: z.date({ required_error: "Created date is required" }),
  updatedAt: z.date({ required_error: "Updated date is required" }),
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
  _id: z.string({ required_error: "Examination ID is required" }),
  patientId: z.string({ required_error: "Patient ID is required" }),
  doctorId: z.string({ required_error: "Doctor ID is required" }),
  scheduledDate: z.date({ required_error: "Scheduled date is required" }),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"], {
    required_error: "Status is required",
  }),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  completedAt: z.date().optional(),
  cancelReason: z.string().optional(),
  followUpDate: z.date().optional(),
  createdAt: z.date({ required_error: "Created date is required" }),
  updatedAt: z.date({ required_error: "Updated date is required" }),
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
  _id: z.string({ required_error: "Emergency case ID is required" }),
  patientId: z.string({ required_error: "Patient ID is required" }),
  teamId: z.string({ required_error: "Team ID is required" }),
  severity: TriageLevelEnum.describe("Severity level is required"),
  status: z.enum(["active", "resolved", "transferred"], {
    required_error: "Status is required",
  }),
  description: z.string({ required_error: "Description is required" }),
  vitalSigns: z.record(z.string(), z.any(), {
    required_error: "Vital signs are required",
  }),
  treatments: z.array(z.string(), {
    required_error: "Treatments list is required",
  }),
  createdAt: z.date({ required_error: "Created date is required" }),
  updatedAt: z.date({ required_error: "Updated date is required" }),
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
