import { Schema, model } from "mongoose";
import type { Bed, PatientAssignment, Ward, WardResource } from "./wardModel";

const WardSchema = new Schema<Ward>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, required: true, default: 0 },
    assignedStaff: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["active", "maintenance", "closed"],
      required: true,
    },
    notes: String,
  },
  { timestamps: true }
);

const BedSchema = new Schema<Bed>({
  wardId: { type: String, required: true },
  number: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "occupied", "reserved", "maintenance", "cleaning"],
    required: true,
    default: "available",
  },
  currentPatientId: String,
  lastOccupiedAt: Date,
  // lastCleanedAt: { type: Date, required: true },
  notes: String,
  features: [String],
});

const WardResourceSchema = new Schema<WardResource>({
  wardId: { type: String, required: true },
  type: {
    type: String,
    enum: ["medical_equipment", "medication", "supplies", "staff"],
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  minimumRequired: { type: Number, required: true },
  // lastRestockedAt: { type: Date, required: true },
  notes: String,
});

const PatientAssignmentSchema = new Schema<PatientAssignment>({
  patientId: { type: String, required: true },
  wardId: { type: String, required: true },
  bedId: { type: String, required: true },
  assignedBy: { type: String, required: true },
  assignedAt: { type: Date, required: true },
  expectedDuration: Number,
  dischargeDate: Date,
  notes: String,
  status: {
    type: String,
    enum: ["active", "discharged", "transferred"],
    required: true,
    default: "active",
  },
});

export const Models = {
  Ward: model<Ward>("Ward", WardSchema),
  Bed: model<Bed>("Bed", BedSchema),
  WardResource: model<WardResource>("WardResource", WardResourceSchema),
  PatientAssignment: model<PatientAssignment>(
    "PatientAssignment",
    PatientAssignmentSchema
  ),
};
