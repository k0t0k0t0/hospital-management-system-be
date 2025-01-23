import mongoose from "mongoose";

// Emergency Contact Schema
export const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Emergency contact name is required"],
  },
  relationship: { type: String, required: [true, "Relationship is required"] },
  primaryPhone: {
    type: String,
    required: [true, "Primary phone number is required"],
  },
  secondaryPhone: String,
  address: {
    type: String,
    required: [true, "Emergency contact address is required"],
  },
});

// Communication Preferences Schema
export const communicationPreferencesSchema = new mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    required: [true, "Email notification preference is required"],
  },
  smsNotifications: {
    type: Boolean,
    required: [true, "SMS notification preference is required"],
  },
  preferredContactTime: String,
});

// Insurance Info Schema
export const insuranceInfoSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: [true, "Insurance provider is required"],
  },
  policyNumber: { type: String, required: [true, "Policy number is required"] },
  groupNumber: String,
  expirationDate: Date,
});

// Patient Schema
export const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    dateOfBirth: { type: Date, required: [true, "Date of birth is required"] },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },
    email: { type: String, required: [true, "Email is required"] },
    address: { type: String, required: [true, "Address is required"] },
    medicalHistory: [{ type: String }],
    preferredLanguage: {
      type: String,
      default: "english",
    },
    emergencyContact: {
      type: {
        name: {
          type: String,
          required: [true, "Emergency contact name is required"],
        },
        relationship: {
          type: String,
          required: [true, "Relationship is required"],
        },
        primaryPhone: {
          type: String,
          required: [true, "Primary phone number is required"],
        },
        secondaryPhone: String,
        address: {
          type: String,
          required: [true, "Emergency contact address is required"],
        },
      },
      required: [true, "Emergency contact information is required"],
    },
    communicationPreferences: {
      type: communicationPreferencesSchema,
      required: [true, "Communication preferences are required"],
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
  }
);

// Add any indexes you need
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ contactNumber: 1 });

// Appointment Schema
export const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    type: {
      type: String,
      required: [true, "Appointment type is required"],
      enum: [
        "regular_checkup",
        "follow_up",
        "consultation",
        "emergency",
        "vaccination",
        "lab_work",
      ],
    },
    status: {
      type: String,
      required: [true, "Appointment status is required"],
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    dateTime: {
      type: Date,
      required: [true, "Appointment date and time are required"],
    },
    duration: {
      type: Number,
      required: [true, "Appointment duration is required"],
    },
    reason: {
      type: String,
      required: [true, "Appointment reason is required"],
    },
    notes: String,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Message Schema
export const messageSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Message ID is required"],
      unique: true,
    },
    patientId: { type: Number, required: [true, "Patient ID is required"] },
    providerId: { type: Number, required: [true, "Provider ID is required"] },
    subject: { type: String, required: [true, "Message subject is required"] },
    content: { type: String, required: [true, "Message content is required"] },
    status: {
      type: String,
      required: [true, "Message status is required"],
      enum: ["sent", "delivered", "read", "archived"],
      default: "sent",
    },
    attachments: [String],
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Emergency Visit Schema
export const emergencyVisitSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Emergency visit ID is required"],
      unique: true,
    },
    patientId: { type: Number, required: [true, "Patient ID is required"] },
    severity: {
      type: String,
      required: [true, "Severity level is required"],
      enum: ["CRITICAL", "SEVERE", "MODERATE", "MILD"],
    },
    description: { type: String, required: [true, "Description is required"] },
    location: { type: String, required: [true, "Location is required"] },
    symptoms: [
      { type: String, required: [true, "At least one symptom is required"] },
    ],
    vitalSigns: {
      bloodPressure: {
        type: String,
        required: [true, "Blood pressure is required"],
      },
      heartRate: { type: Number, required: [true, "Heart rate is required"] },
      temperature: {
        type: Number,
        required: [true, "Temperature is required"],
      },
      oxygenSaturation: {
        type: Number,
        required: [true, "Oxygen saturation is required"],
      },
    },
    attendingStaffId: {
      type: Number,
      required: [true, "Attending staff ID is required"],
    },
    outcome: String,
  },
  {
    timestamps: true,
  }
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
export const AppointmentModel = mongoose.model(
  "Appointment",
  appointmentSchema
);
export const MessageModel = mongoose.model("Message", messageSchema);
export const EmergencyVisitModel = mongoose.model(
  "EmergencyVisit",
  emergencyVisitSchema
);

export const PatientModel = mongoose.model("Patient", patientSchema);
