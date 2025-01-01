import type {
  Appointment,
  EmergencyVisit,
  Message,
  Patient,
} from "@/api/patient/patientModel";

// In-memory storage
export const patients: Patient[] = [];
export const appointments: Appointment[] = [];
export const messages: Message[] = [];
export const emergencyVisits: EmergencyVisit[] = [];

export class PatientRepository {
  // Existing patient methods
  async findAllAsync(): Promise<Patient[]> {
    return patients;
  }

  async findByIdAsync(id: number): Promise<Patient | null> {
    return patients.find((p) => p.id === id) || null;
  }

  async createAsync(
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: patients.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    patients.push(newPatient);
    return newPatient;
  }

  async updateAsync(
    id: number,
    patientData: Partial<Patient>
  ): Promise<Patient | null> {
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date(),
    };
    return patients[index];
  }

  async deleteAsync(id: number): Promise<boolean> {
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) return false;

    patients.splice(index, 1);
    return true;
  }

  // New appointment methods
  async findAppointmentsByPatientAsync(
    patientId: number
  ): Promise<Appointment[]> {
    return appointments.filter((a) => a.patientId === patientId);
  }

  async findAppointmentsByDoctorAsync(
    doctorId: number
  ): Promise<Appointment[]> {
    return appointments.filter((a) => a.doctorId === doctorId);
  }

  async findAppointmentByIdAsync(id: number): Promise<Appointment | null> {
    return appointments.find((a) => a.id === id) || null;
  }

  async createAppointmentAsync(
    appointment: Omit<Appointment, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: appointments.length + 1,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointmentAsync(
    id: number,
    appointmentData: Partial<Appointment>
  ): Promise<Appointment | null> {
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;

    appointments[index] = {
      ...appointments[index],
      ...appointmentData,
      updatedAt: new Date(),
    };
    return appointments[index];
  }

  async findUpcomingAppointmentsAsync(
    patientId: number
  ): Promise<Appointment[]> {
    const now = new Date();
    return appointments.filter(
      (a) =>
        a.patientId === patientId &&
        a.dateTime > now &&
        a.status !== "cancelled"
    );
  }

  // New message methods
  async findMessagesByPatientAsync(patientId: number): Promise<Message[]> {
    return messages.filter((m) => m.patientId === patientId);
  }

  async findMessagesByProviderAsync(providerId: number): Promise<Message[]> {
    return messages.filter((m) => m.providerId === providerId);
  }

  async findMessageByIdAsync(id: number): Promise<Message | null> {
    return messages.find((m) => m.id === id) || null;
  }

  async createMessageAsync(
    message: Omit<
      Message,
      "id" | "status" | "createdAt" | "updatedAt" | "readAt"
    >
  ): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: messages.length + 1,
      status: "sent",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    messages.push(newMessage);
    return newMessage;
  }

  async updateMessageAsync(
    id: number,
    messageData: Partial<Message>
  ): Promise<Message | null> {
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return null;

    messages[index] = {
      ...messages[index],
      ...messageData,
      updatedAt: new Date(),
    };
    return messages[index];
  }

  async findUnreadMessagesAsync(patientId: number): Promise<Message[]> {
    return messages.filter(
      (m) =>
        m.patientId === patientId &&
        m.status !== "read" &&
        m.status !== "archived"
    );
  }

  async markMessageAsReadAsync(id: number): Promise<Message | null> {
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return null;

    messages[index] = {
      ...messages[index],
      status: "read",
      readAt: new Date(),
      updatedAt: new Date(),
    };
    return messages[index];
  }

  // Add new search method
  async searchPatientsAsync(searchParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    contactNumber?: string;
  }): Promise<Patient[]> {
    return patients.filter((patient) => {
      return Object.entries(searchParams).every(([key, value]) => {
        if (!value) return true; // Skip empty search parameters
        const patientValue = patient[key as keyof Patient]
          ?.toString()
          .toLowerCase();
        return patientValue?.includes(value.toLowerCase());
      });
    });
  }

  async createEmergencyVisitAsync(
    visitData: Omit<EmergencyVisit, "id" | "createdAt" | "updatedAt">
  ): Promise<EmergencyVisit> {
    const newVisit: EmergencyVisit = {
      ...visitData,
      id: emergencyVisits.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    emergencyVisits.push(newVisit);
    return newVisit;
  }

  async getLastEmergencyVisit(
    patientId: number
  ): Promise<EmergencyVisit | null> {
    const patientVisits = emergencyVisits
      .filter((visit) => visit.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return patientVisits[0] || null;
  }
}

export const patientRepository = new PatientRepository();
