import { z } from "@/common/utils/zodExtensions";
import { model } from "mongoose";
import { commonValidations } from "../../common/utils/commonValidation";
import { appointmentSchema, emergencyVisitSchema, messageSchema, patientSchema } from "./patientSchema";

// Base schemas
export const EmergencyContactSchema = z.object({
  name: commonValidations.name,
  relationship: z.string(),
  primaryPhone: commonValidations.phone,
  secondaryPhone: commonValidations.phone.optional(),
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
  expirationDate: commonValidations.optionalDate,
});

// Enums
export const AppointmentStatusEnum = z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]);

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
  firstName: commonValidations.name,
  lastName: commonValidations.name,
  dateOfBirth: commonValidations.date,
  gender: z.enum(["male", "female", "other"]),
  contactNumber: commonValidations.phone,
  email: commonValidations.email,
  address: z.string(),
  medicalHistory: commonValidations.nonEmptyArray,
  preferredLanguage: z.string().default("english"),
  emergencyContact: EmergencyContactSchema,
  communicationPreferences: z.object({
    emailNotifications: commonValidations.boolean,
    smsNotifications: commonValidations.boolean,
    preferredContactTime: z.string().nullable().optional(),
  }),
  bloodType: z.string().nullable().optional(),
  allergies: z.array(z.string()).nullable().optional(),
  chronicConditions: z.array(z.string()).nullable().optional(),
  currentMedications: z.array(z.string()).nullable().optional(),
  recentProcedures: z.array(z.string()).nullable().optional(),
  insuranceInfo: InsuranceInfoSchema.nullable().optional(),
  lastEmergencyVisit: commonValidations.optionalDate,
  ...commonValidations.timestamps,
});

export const AppointmentSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  type: AppointmentTypeEnum,
  status: AppointmentStatusEnum,
  dateTime: commonValidations.date,
  duration: commonValidations.positiveNumber,
  reason: z.string(),
  notes: z.string().optional(),
  cancelledAt: commonValidations.optionalDate,
  cancelReason: z.string().optional(),
  ...commonValidations.timestamps,
});

export const MessageSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  subject: z.string(),
  content: z.string(),
  status: MessageStatusEnum,
  attachments: z.array(z.string()).optional(),
  readAt: commonValidations.optionalDate,
  ...commonValidations.timestamps,
});

export const EmergencyVisitSchema = z.object({
  patientId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  severity: EmergencySeverityEnum,
  description: z.string(),
  location: z.string(),
  symptoms: z.array(z.string()),
  vitalSigns: VitalSignsSchema,
  attendingStaffId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  outcome: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PatientEmergencySchema = z.object({
  patientInfo: z.object({
    firstName: commonValidations.name,
    lastName: commonValidations.name,
    dateOfBirth: commonValidations.date,
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
  lastEmergencyVisit: z
    .object({
      date: commonValidations.date,
      reason: z.string(),
      outcome: z.string(),
    })
    .optional(),
});

// Create schemas (updated to remove id and use MongoDB's _id)
export const CreatePatientSchema = PatientSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  status: true,
  createdAt: true,
  updatedAt: true,
  cancelledAt: true,
  cancelReason: true,
});

export const CreateMessageSchema = MessageSchema.omit({
  status: true,
  createdAt: true,
  updatedAt: true,
  readAt: true,
});

export const CreateEmergencyVisitSchema = EmergencyVisitSchema.omit({
  createdAt: true,
  updatedAt: true,
});

// Types (MongoDB will add _id automatically)
export type Patient = z.infer<typeof PatientSchema> & { _id: string };
export type Appointment = z.infer<typeof AppointmentSchema> & { _id: string };
export type Message = z.infer<typeof MessageSchema> & { _id: string };
export type EmergencyVisit = z.infer<typeof EmergencyVisitSchema> & {
  _id: string;
};
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type VitalSigns = z.infer<typeof VitalSignsSchema>;

export const PatientModel = model("Patient", patientSchema);
export const AppointmentModel = model("Appointment", appointmentSchema);
export const MessageModel = model("Message", messageSchema);
export const EmergencyVisitModel = model("EmergencyVisit", emergencyVisitSchema);
