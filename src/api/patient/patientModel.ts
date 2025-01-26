import { z } from "@/common/utils/zodExtensions";
import { model } from "mongoose";
import { commonValidations } from "../../common/utils/commonValidation";
import {
  appointmentSchema,
  emergencyVisitSchema,
  messageSchema,
  patientSchema,
} from "./patientSchema";

// Base schemas
export const EmergencyContactSchema = z.object({
  name: z
    .string({
      required_error: "Emergency contact name is required",
      invalid_type_error: "Emergency contact name must be a string",
    })
    .min(2, "Name must be at least 2 characters"),
  relationship: z.string({
    required_error: "Relationship is required",
    invalid_type_error: "Relationship must be a string",
  }),
  primaryPhone: z.string({
    required_error: "Primary phone is required",
    invalid_type_error: "Primary phone must be a string",
  }),
  secondaryPhone: z
    .string({
      invalid_type_error: "Secondary phone must be a string",
    })
    .optional(),
});

export const VitalSignsSchema = z.object({
  bloodPressure: z.string({
    required_error: "Blood pressure is required",
    invalid_type_error: "Blood pressure must be a string",
  }),
  heartRate: z.number({
    required_error: "Heart rate is required",
    invalid_type_error: "Heart rate must be a number",
  }),
  temperature: z.number({
    required_error: "Temperature is required",
    invalid_type_error: "Temperature must be a number",
  }),
  oxygenSaturation: z.number({
    required_error: "Oxygen saturation is required",
    invalid_type_error: "Oxygen saturation must be a number",
  }),
});

export const InsuranceInfoSchema = z.object({
  provider: z.string({
    required_error: "Insurance provider is required",
    invalid_type_error: "Insurance provider must be a string",
  }),
  policyNumber: z.string({
    required_error: "Policy number is required",
    invalid_type_error: "Policy number must be a string",
  }),
  groupNumber: z
    .string({
      invalid_type_error: "Group number must be a string",
    })
    .optional(),
  expirationDate: z
    .string({
      invalid_type_error: "Expiration date must be a string",
    })
    .optional(),
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

export const MessageStatusEnum = z.enum([
  "sent",
  "delivered",
  "read",
  "archived",
]);

export const EmergencySeverityEnum = z.enum([
  "CRITICAL",
  "SEVERE",
  "MODERATE",
  "MILD",
]);

// Complex schemas
export const PatientSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required",
      invalid_type_error: "First name must be a string",
    })
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string({
      required_error: "Last name is required",
      invalid_type_error: "Last name must be a string",
    })
    .min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string({
    required_error: "Date of birth is required",
    invalid_type_error: "Date of birth must be a string",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender must be either male, female, or other",
  }),
  contactNumber: z.string({
    required_error: "Contact number is required",
    invalid_type_error: "Contact number must be a string",
  }),
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format"),
  address: z.string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a string",
  }),
  medicalHistory: z
    .array(
      z.string({
        invalid_type_error: "Medical history entries must be strings",
      }),
      {
        required_error: "Medical history is required",
        invalid_type_error: "Medical history must be an array",
      }
    )
    .min(1, "At least one medical history entry is required"),
  preferredLanguage: z
    .string({
      invalid_type_error: "Preferred language must be a string",
    })
    .default("english"),
  emergencyContact: EmergencyContactSchema,
  communicationPreferences: z.object({
    emailNotifications: z.boolean({
      required_error: "Email notification preference is required",
    }),
    smsNotifications: z.boolean({
      required_error: "SMS notification preference is required",
    }),
    preferredContactTime: z.string().nullable().optional(),
  }),
  bloodType: z.string().nullable().optional(),
  allergies: z.array(z.string()).nullable().optional(),
  chronicConditions: z.array(z.string()).nullable().optional(),
  currentMedications: z.array(z.string()).nullable().optional(),
  recentProcedures: z.array(z.string()).nullable().optional(),
  insuranceInfo: InsuranceInfoSchema.nullable().optional(),
  lastEmergencyVisit: z.coerce
    .date({
      required_error: "Last emergency visit date is required",
      invalid_type_error: "Last emergency visit must be a valid date",
    })
    .optional(),
  createdAt: z.coerce.date({
    required_error: "Created date is required",
    invalid_type_error: "Created date must be a valid date",
  }),
  updatedAt: z.coerce.date({
    required_error: "Updated date is required",
    invalid_type_error: "Updated date must be a valid date",
  }),
});

export const AppointmentSchema = z.object({
  patientId: z
    .string({
      required_error: "Patient ID is required",
      invalid_type_error: "Patient ID must be a string",
    })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID format"),
  doctorId: z
    .string({
      required_error: "Doctor ID is required",
      invalid_type_error: "Doctor ID must be a string",
    })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID format"),
  type: AppointmentTypeEnum.describe("Appointment type is required"),
  status: AppointmentStatusEnum.describe("Appointment status is required"),
  dateTime: z
    .string({ required_error: "Date and time are required" })
    .datetime("Invalid date time format"),
  duration: z
    .number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a number",
    })
    .positive("Duration must be positive"),
  reason: z.string({
    required_error: "Appointment reason is required",
    invalid_type_error: "Appointment reason must be a string",
  }),
  notes: z
    .string({
      invalid_type_error: "Notes must be a string",
    })
    .optional(),
  cancelledAt: z
    .string()
    .datetime("Invalid cancellation date format")
    .optional(),
  cancelReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MessageSchema = z.object({
  patientId: z
    .string({ required_error: "Patient ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID format"),
  providerId: z
    .string({ required_error: "Provider ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid provider ID format"),
  subject: z.string({ required_error: "Message subject is required" }),
  content: z.string({ required_error: "Message content is required" }),
  status: MessageStatusEnum.describe("Message status is required"),
  attachments: z.array(z.string()).optional(),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmergencyVisitSchema = z.object({
  patientId: z
    .string({ required_error: "Patient ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid patient ID format"),
  severity: EmergencySeverityEnum.describe("Severity level is required"),
  description: z.string({ required_error: "Description is required" }),
  location: z.string({ required_error: "Location is required" }),
  symptoms: z.array(z.string(), { required_error: "Symptoms are required" }),
  vitalSigns: VitalSignsSchema,
  attendingStaffId: z
    .string({ required_error: "Attending staff ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid staff ID format"),
  outcome: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PatientEmergencySchema = z.object({
  patientInfo: z.object({
    firstName: z
      .string({
        required_error: "First name is required",
        invalid_type_error: "First name must be a string",
      })
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string({
        required_error: "Last name is required",
        invalid_type_error: "Last name must be a string",
      })
      .min(2, "Last name must be at least 2 characters"),
    dateOfBirth: z.string({
      required_error: "Date of birth is required",
      invalid_type_error: "Date of birth must be a string",
    }),
    bloodType: z
      .string({
        invalid_type_error: "Blood type must be a string",
      })
      .optional(),
    allergies: z
      .array(
        z.string({
          invalid_type_error: "Allergy must be a string",
        })
      )
      .optional(),
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
      date: z.string({
        required_error: "Emergency visit date is required",
        invalid_type_error: "Emergency visit date must be a string",
      }),
      reason: z.string({
        required_error: "Emergency visit reason is required",
        invalid_type_error: "Emergency visit reason must be a string",
      }),
      outcome: z.string({
        required_error: "Emergency visit outcome is required",
        invalid_type_error: "Emergency visit outcome must be a string",
      }),
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
}).extend({
  dateTime: z.string().datetime(),
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
export const EmergencyVisitModel = model(
  "EmergencyVisit",
  emergencyVisitSchema
);

// Update the Appointment interface
// export interface Appointment {
//   _id: string;
//   patientId: string;
//   doctorId: string;
//   dateTime: Date;
//   duration: number;
//   status: "scheduled" | "completed" | "cancelled";
//   notes?: string;
//   cancelReason?: string;
//   cancelledAt?: Date;
//   // Add these new fields
//   doctor?: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
//   patient?: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
// }
