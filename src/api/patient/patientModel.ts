import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Base schemas
export const EmergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  primaryPhone: z.string(),
  secondaryPhone: z.string().optional(),
  address: z.string(),
});

export const VitalSignsSchema = z.object({
  bloodPressure: z.string(),
  heartRate: z.number(),
  temperature: z.number(),
  oxygenSaturation: z.number(),
});

export const InsuranceInfoSchema = z.object({
  provider: z.string(),
  policyNumber: z.string(),
  groupNumber: z.string().optional(),
  expirationDate: z.date().optional(),
});

// Enums
export const AppointmentStatusEnum = z.enum([
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const AppointmentTypeEnum = z.enum([
  "regular_checkup",
  "follow_up",
  "consultation",
  "emergency",
  "vaccination",
  "lab_work",
]);

export const MessageStatusEnum = z.enum(["sent", "delivered", "read", "archived"]);

export const EmergencySeverityEnum = z.enum(["CRITICAL", "SEVERE", "MODERATE", "MILD"]);

// Complex schemas
export const PatientSchema = z.object({
  id: z.number(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  contactNumber: z.string(),
  email: z.string().email(),
  address: z.string(),
  medicalHistory: z.array(z.string()),
  preferredLanguage: z.string().default("english"),
  emergencyContact: EmergencyContactSchema,
  communicationPreferences: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    preferredContactTime: z.string().optional(),
  }),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  recentProcedures: z.array(z.string()).optional(),
  insuranceInfo: InsuranceInfoSchema.optional(),
  lastEmergencyVisit: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppointmentSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  doctorId: z.number(),
  type: AppointmentTypeEnum,
  status: AppointmentStatusEnum,
  dateTime: z.date(),
  duration: z.number(),
  reason: z.string(),
  notes: z.string().optional(),
  cancelledAt: z.date().optional(),
  cancelReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MessageSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  providerId: z.number(),
  subject: z.string(),
  content: z.string(),
  status: MessageStatusEnum,
  attachments: z.array(z.string()).optional(),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmergencyVisitSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  severity: EmergencySeverityEnum,
  description: z.string(),
  location: z.string(),
  symptoms: z.array(z.string()),
  vitalSigns: VitalSignsSchema,
  attendingStaffId: z.number(),
  outcome: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PatientEmergencySchema = z.object({
  patientInfo: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date(),
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
  }),
  emergencyContact: EmergencyContactSchema,
  medicalHistory: z.object({
    chronicConditions: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    recentProcedures: z.array(z.string()).optional(),
  }),
  insuranceInfo: InsuranceInfoSchema.optional(),
  lastEmergencyVisit: z.object({
    date: z.date(),
    reason: z.string(),
    outcome: z.string(),
  }).optional(),
});

// Create schemas (omitting auto-generated fields)
export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  cancelledAt: true,
  cancelReason: true,
});

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  readAt: true,
});

export const CreateEmergencyVisitSchema = EmergencyVisitSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Patient = z.infer<typeof PatientSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type EmergencyVisit = z.infer<typeof EmergencyVisitSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type VitalSigns = z.infer<typeof VitalSignsSchema>;
