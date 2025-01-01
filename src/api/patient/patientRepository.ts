import { AppointmentModel, EmergencyVisitModel, MessageModel, PatientModel } from "./patientModel";
import type { Appointment, EmergencyVisit, Message, Patient } from "./patientModel";

export class PatientRepository {
  async findAllAsync(): Promise<Patient[]> {
    const patients = await PatientModel.find().lean();
    return patients.map(this.sanitizePatientData);
  }

  async findByIdAsync(id: string): Promise<Patient | null> {
    const patient = await PatientModel.findById(id).lean();
    return patient ? this.sanitizePatientData(patient) : null;
  }

  async createAsync(patient: Omit<Patient, "_id" | "createdAt" | "updatedAt">): Promise<Patient> {
    const newPatient = new PatientModel(patient);
    await newPatient.save();
    return this.sanitizePatientData(newPatient.toObject());
  }

  async updateAsync(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
    const updated = await PatientModel.findByIdAndUpdate(id, { $set: patientData }, { new: true }).lean();
    return updated ? this.sanitizePatientData(updated) : null;
  }

  // Helper method to sanitize patient data
  private sanitizePatientData(patient: any): Patient {
    return {
      ...patient,
      emergencyContact: {
        ...patient.emergencyContact,
        secondaryPhone: patient.emergencyContact?.secondaryPhone || undefined,
      },
      communicationPreferences: {
        ...patient.communicationPreferences,
        preferredContactTime: patient.communicationPreferences?.preferredContactTime || undefined,
      },
      bloodType: patient.bloodType || undefined,
      allergies: patient.allergies || undefined,
      chronicConditions: patient.chronicConditions || undefined,
      currentMedications: patient.currentMedications || undefined,
      recentProcedures: patient.recentProcedures || undefined,
      insuranceInfo: patient.insuranceInfo || undefined,
      lastEmergencyVisit: patient.lastEmergencyVisit || undefined,
    };
  }

  // Appointment methods with simplified error handling
  async findAppointmentsByPatientAsync(
    patientId: string,
    options?: { status?: string; fromDate?: Date },
  ): Promise<Appointment[]> {
    const query: any = { patientId };
    if (options?.status) query.status = options.status;
    if (options?.fromDate) query.dateTime = { $gte: options.fromDate };

    return AppointmentModel.find(query)
      .sort({ dateTime: 1 })
      .lean()
      .then((appointments) => appointments.map(this.sanitizeAppointmentData));
  }

  async createAppointmentAsync(
    appointment: Omit<Appointment, "_id" | "status" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> {
    const newAppointment = new AppointmentModel({
      ...appointment,
      status: "scheduled",
    });
    await newAppointment.save();
    return this.sanitizeAppointmentData(newAppointment.toObject());
  }

  async updateAppointmentStatusAsync(
    appointmentId: string,
    status: string,
    reason?: string,
  ): Promise<Appointment | null> {
    const update: any = { status };
    if (status === "cancelled") {
      update.cancelledAt = new Date();
      update.cancelReason = reason;
    }

    const updated = await AppointmentModel.findByIdAndUpdate(appointmentId, { $set: update }, { new: true }).lean();

    return updated ? this.sanitizeAppointmentData(updated) : null;
  }

  // Message methods with simplified error handling
  async findMessagesAsync(patientId: string, options?: { status?: string[]; limit?: number }): Promise<Message[]> {
    const query: any = { patientId };
    if (options?.status) query.status = { $in: options.status };

    return MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit || 50)
      .lean()
      .then((messages) => messages.map(this.sanitizeMessageData));
  }

  async createMessageAsync(
    message: Omit<Message, "_id" | "status" | "createdAt" | "updatedAt" | "readAt">,
  ): Promise<Message> {
    const newMessage = new MessageModel({
      ...message,
      status: "sent",
    });
    await newMessage.save();
    return this.sanitizeMessageData(newMessage.toObject());
  }

  async updateMessageStatusAsync(messageId: string, status: string): Promise<Message | null> {
    const update: any = { status };
    if (status === "read") {
      update.readAt = new Date();
    }

    const updated = await MessageModel.findByIdAndUpdate(messageId, { $set: update }, { new: true }).lean();

    return updated ? this.sanitizeMessageData(updated) : null;
  }

  // Emergency visit methods
  async findEmergencyVisitsAsync(
    patientId: string,
    options?: { severity?: string; limit?: number },
  ): Promise<EmergencyVisit[]> {
    const query: any = { patientId };
    if (options?.severity) query.severity = options.severity;

    return EmergencyVisitModel.find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit || 10)
      .lean()
      .then((visits) => visits.map(this.sanitizeEmergencyVisitData));
  }

  async createEmergencyVisitAsync(
    visit: Omit<EmergencyVisit, "_id" | "createdAt" | "updatedAt">,
  ): Promise<EmergencyVisit> {
    const newVisit = new EmergencyVisitModel(visit);
    await newVisit.save();
    return this.sanitizeEmergencyVisitData(newVisit.toObject());
  }

  async updateEmergencyVisitAsync(visitId: string, update: Partial<EmergencyVisit>): Promise<EmergencyVisit | null> {
    const updated = await EmergencyVisitModel.findByIdAndUpdate(visitId, { $set: update }, { new: true }).lean();

    return updated ? this.sanitizeEmergencyVisitData(updated) : null;
  }

  // Sanitization Helper Methods
  private sanitizeAppointmentData(appointment: any): Appointment {
    return {
      ...appointment,
      notes: appointment.notes || undefined,
      cancelledAt: appointment.cancelledAt || undefined,
      cancelReason: appointment.cancelReason || undefined,
    };
  }

  private sanitizeMessageData(message: any): Message {
    return {
      ...message,
      attachments: message.attachments || undefined,
      readAt: message.readAt || undefined,
    };
  }

  private sanitizeEmergencyVisitData(visit: any): EmergencyVisit {
    return {
      ...visit,
      outcome: visit.outcome || undefined,
    };
  }

  // Search method with simplified query building
  async searchPatientsAsync(searchParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    contactNumber?: string;
  }): Promise<Patient[]> {
    const query = Object.entries(searchParams)
      .filter(([_, value]) => value)
      .reduce(
        (acc, [key, value]) => {
          acc[key] = new RegExp(value!, "i");
          return acc;
        },
        {} as Record<string, RegExp>,
      );

    const patients = await PatientModel.find(query).lean();
    return patients.map(this.sanitizePatientData);
  }

  async deleteAsync(id: string): Promise<boolean> {
    const result = await PatientModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findAppointmentByIdAsync(id: string): Promise<Appointment | null> {
    const appointment = await AppointmentModel.findById(id).lean();
    return appointment ? this.sanitizeAppointmentData(appointment) : null;
  }

  async updateAppointmentAsync(id: string, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    const updated = await AppointmentModel.findByIdAndUpdate(id, { $set: appointmentData }, { new: true }).lean();
    return updated ? this.sanitizeAppointmentData(updated) : null;
  }

  async findUpcomingAppointmentsAsync(patientId: string): Promise<Appointment[]> {
    return this.findAppointmentsByPatientAsync(patientId, {
      status: "scheduled",
      fromDate: new Date(),
    });
  }

  async findMessagesByPatientAsync(patientId: string): Promise<Message[]> {
    return this.findMessagesAsync(patientId);
  }

  async findUnreadMessagesAsync(patientId: string): Promise<Message[]> {
    return this.findMessagesAsync(patientId, {
      status: ["sent", "delivered"],
    });
  }

  async markMessageAsReadAsync(messageId: string): Promise<Message | null> {
    return this.updateMessageStatusAsync(messageId, "read");
  }

  async getLastEmergencyVisit(patientId: string): Promise<EmergencyVisit | null> {
    const visits = await this.findEmergencyVisitsAsync(patientId, { limit: 1 });
    return visits.length > 0 ? visits[0] : null;
  }
}

export const patientRepository = new PatientRepository();
