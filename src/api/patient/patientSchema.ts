import mongoose from "mongoose";

// Emergency Contact Schema
export const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  primaryPhone: { type: String, required: true },
  secondaryPhone: String,
  address: { type: String, required: true },
});

// Communication Preferences Schema
export const communicationPreferencesSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, required: true },
  smsNotifications: { type: Boolean, required: true },
  preferredContactTime: String,
});

// Insurance Info Schema
export const insuranceInfoSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  groupNumber: String,
  expirationDate: Date,
});

// Patient Schema
export const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    medicalHistory: [{ type: String }],
    preferredLanguage: {
      type: String,
      default: "english",
    },
    emergencyContact: {
      type: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        primaryPhone: { type: String, required: true },
        secondaryPhone: String,
        address: { type: String, required: true },
      },
      required: true,
    },
    communicationPreferences: {
      type: communicationPreferencesSchema,
      required: true,
    },
    bloodType: String,
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    recentProcedures: [String],
    insuranceInfo: insuranceInfoSchema,
    lastEmergencyVisit: Date,
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  },
);

// Add any indexes you need
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ contactNumber: 1 });

// Appointment Schema
export const appointmentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    patientId: { type: Number, required: true },
    doctorId: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: ["regular_checkup", "follow_up", "consultation", "emergency", "vaccination", "lab_work"],
    },
    status: {
      type: String,
      required: true,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    dateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    reason: { type: String, required: true },
    notes: String,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  },
);

// Message Schema
export const messageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    patientId: { type: Number, required: true },
    providerId: { type: Number, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["sent", "delivered", "read", "archived"],
      default: "sent",
    },
    attachments: [String],
    readAt: Date,
  },
  {
    timestamps: true,
  },
);

// Emergency Visit Schema
export const emergencyVisitSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    patientId: { type: Number, required: true },
    severity: {
      type: String,
      required: true,
      enum: ["CRITICAL", "SEVERE", "MODERATE", "MILD"],
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    symptoms: [{ type: String, required: true }],
    vitalSigns: {
      bloodPressure: { type: String, required: true },
      heartRate: { type: Number, required: true },
      temperature: { type: Number, required: true },
      oxygenSaturation: { type: Number, required: true },
    },
    attendingStaffId: { type: Number, required: true },
    outcome: String,
  },
  {
    timestamps: true,
  },
);

// Add indexes for better query performance
appointmentSchema.index({ patientId: 1, dateTime: 1 });
appointmentSchema.index({ doctorId: 1, dateTime: 1 });
appointmentSchema.index({ status: 1 });

messageSchema.index({ patientId: 1, createdAt: -1 });
messageSchema.index({ providerId: 1, createdAt: -1 });
messageSchema.index({ status: 1 });

emergencyVisitSchema.index({ patientId: 1, createdAt: -1 });
emergencyVisitSchema.index({ severity: 1 });
emergencyVisitSchema.index({ attendingStaffId: 1 });

// Export models
export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
export const MessageModel = mongoose.model("Message", messageSchema);
export const EmergencyVisitModel = mongoose.model("EmergencyVisit", emergencyVisitSchema);

export const PatientModel = mongoose.model("Patient", patientSchema);
