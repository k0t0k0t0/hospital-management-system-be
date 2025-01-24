import { appointmentSchema } from "@/api/patient/patientSchema";
import { type Document, Schema, model } from "mongoose";
import type {
  AdminStaff,
  Doctor,
  EmergencyTeamMember,
  LabTechnician,
  Nurse,
} from "./staffModel";

// Base interface for all staff members
interface StaffBaseDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  employeeId: string;
  department: string;
}

// Doctor interface
interface DoctorDocument extends StaffBaseDocument, Omit<Doctor, "id"> {}

// Nurse interface
interface NurseDocument extends StaffBaseDocument, Omit<Nurse, "id"> {}

// Admin interface
interface AdminStaffDocument
  extends StaffBaseDocument,
    Omit<AdminStaff, "id"> {}

// Emergency Team Member interface
interface EmergencyTeamMemberDocument
  extends StaffBaseDocument,
    Omit<EmergencyTeamMember, "id"> {}

// Lab Technician interface
interface LabTechnicianDocument
  extends StaffBaseDocument,
    Omit<LabTechnician, "id"> {}

// Base schema for all staff members
const staffBaseSchema = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  address: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
};

// Doctor Schema
const doctorSchema = new Schema(
  {
    ...staffBaseSchema,
    role: { type: String, default: "doctor", immutable: true },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Nurse Schema
const nurseSchema = new Schema(
  {
    ...staffBaseSchema,
    role: { type: String, default: "nurse", immutable: true },
    shift: {
      type: String,
      enum: ["morning", "afternoon", "night"],
      required: true,
    },
    certificationNumber: { type: String, required: true },
  },
  { timestamps: true }
);

// Admin Staff Schema
const adminStaffSchema = new Schema(
  {
    ...staffBaseSchema,
    role: { type: String, default: "admin", immutable: true },
    position: {
      type: String,
      enum: [
        "hospital_manager",
        "resource_coordinator",
        "system_administrator",
        "finance_manager",
        "hr_manager",
      ],
      required: true,
    },
    accessLevel: {
      type: String,
      enum: ["full", "restricted", "readonly"],
      required: true,
    },
    responsibilities: [{ type: String }],
    managedDepartments: [{ type: String }],
  },
  { timestamps: true }
);

// Emergency Team Member Schema
const emergencyTeamMemberSchema = new Schema(
  {
    ...staffBaseSchema,
    role: { type: String, default: "emergency", immutable: true },
    emergencyRole: {
      type: String,
      enum: [
        "team_lead",
        "emergency_physician",
        "trauma_surgeon",
        "emergency_nurse",
        "paramedic",
        "triage_coordinator",
        "ambulance_driver",
        "ambulance_technician",
        "ambulance_attendant",
      ],
      required: true,
    },
    specializedTraining: [{ type: String }],
    certifications: [{ type: String }],
    triageAccess: [
      {
        type: String,
        enum: [
          "level1_resuscitation",
          "level2_emergent",
          "level3_urgent",
          "level4_less_urgent",
          "level5_non_urgent",
        ],
      },
    ],
    activeShift: { type: Boolean, required: true },
    lastEmergencyResponse: { type: Date },
    responseTeamId: { type: String },
  },
  { timestamps: true }
);

// Lab Technician Schema
const labTechnicianSchema = new Schema(
  {
    ...staffBaseSchema,
    role: { type: String, default: "lab_technician", immutable: true },
    specialization: [
      {
        type: String,
        enum: [
          "blood_work",
          "urinalysis",
          "imaging",
          "biopsy",
          "microbiology",
          "genetic_testing",
          "toxicology",
        ],
      },
    ],
    certifications: [{ type: String }],
    labId: { type: String, required: true },
    activeShift: { type: Boolean, required: true },
    equipmentQualifications: [{ type: String }],
  },
  { timestamps: true }
);

// Emergency Case Schema
const emergencyCaseSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, required: true },
    triageLevel: {
      type: String,
      enum: [
        "level1_resuscitation",
        "level2_emergent",
        "level3_urgent",
        "level4_less_urgent",
        "level5_non_urgent",
      ],
      required: true,
    },
    description: { type: String, required: true },
    assignedTeamMembers: [
      { type: Schema.Types.ObjectId, ref: "EmergencyTeamMember" },
    ],
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "transferred"],
      default: "pending",
    },
    requiredResources: [{ type: String }],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// Lab Test Schema
const labTestSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, required: true },
    requestedById: { type: Schema.Types.ObjectId, required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: "LabTechnician" },
    type: {
      type: String,
      enum: [
        "blood_work",
        "urinalysis",
        "imaging",
        "biopsy",
        "microbiology",
        "genetic_testing",
        "toxicology",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "pending_review",
      ],
      default: "scheduled",
    },
    priority: {
      type: String,
      enum: ["routine", "urgent", "stat"],
      required: true,
    },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    results: {
      data: { type: Map, of: Schema.Types.Mixed },
      notes: String,
      attachments: [String],
    },
  },
  { timestamps: true }
);

// Examination Schema
const examinationSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, required: true },
    doctorId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ["physical", "laboratory", "imaging", "specialist"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    notes: String,
    results: {
      findings: String,
      recommendations: String,
      attachments: [String],
    },
    cancelReason: String,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Create and export models
const AdminStaffModel = model<AdminStaffDocument>(
  "AdminStaff",
  adminStaffSchema
);

// Export all models together at the end
export const Models = {
  Doctor: model<DoctorDocument>("Doctor", doctorSchema),
  Nurse: model<NurseDocument>("Nurse", nurseSchema),
  AdminStaff: AdminStaffModel,
  EmergencyTeamMember: model<EmergencyTeamMemberDocument>(
    "EmergencyTeamMember",
    emergencyTeamMemberSchema
  ),
  LabTechnician: model<LabTechnicianDocument>(
    "LabTechnician",
    labTechnicianSchema
  ),
  EmergencyCase: model<Document>("EmergencyCase", emergencyCaseSchema),
  LabTest: model<Document>("LabTest", labTestSchema),
  Examination: model<Document>("Examination", examinationSchema),
  Appointment: model("Appointment", appointmentSchema),
};
