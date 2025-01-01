import type { Appointment } from "../patient/patientModel";
import type { Examination } from "../staff/examModel";

export const appointments: Appointment[] = [];
export const examinations: Examination[] = [];

export class AppointmentRepository {
  async findByDoctorAndDateRange(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    return appointments.filter(
      (apt) =>
        apt.doctorId === doctorId &&
        apt.dateTime >= startDate &&
        apt.dateTime <= endDate
    );
  }

  async findBusyDoctors(
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<number[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const busyDoctors = new Set<number>();

    appointments
      .filter((apt) => apt.dateTime >= dayStart && apt.dateTime <= dayEnd)
      .forEach((apt) => {
        const aptHour = apt.dateTime.getHours();
        const aptMinute = apt.dateTime.getMinutes();
        const aptEndHour = aptHour + Math.floor(apt.duration / 60);
        const aptEndMinute = aptMinute + (apt.duration % 60);

        if (
          (aptHour > startHour ||
            (aptHour === startHour && aptMinute >= startMinute)) &&
          (aptEndHour < endHour ||
            (aptEndHour === endHour && aptEndMinute <= endMinute))
        ) {
          busyDoctors.add(apt.doctorId);
        }
      });

    return Array.from(busyDoctors);
  }

  async findExaminationByIdAsync(id: number): Promise<Examination | null> {
    return examinations.find((exam) => exam.id === id) || null;
  }

  async createExaminationAsync(
    examination: Omit<Examination, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<Examination> {
    const newExamination: Examination = {
      ...examination,
      id: examinations.length + 1,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    examinations.push(newExamination);
    return newExamination;
  }

  async updateExaminationAsync(
    id: number,
    examinationData: Partial<Examination>
  ): Promise<Examination | null> {
    const index = examinations.findIndex((e) => e.id === id);
    if (index === -1) return null;

    examinations[index] = {
      ...examinations[index],
      ...examinationData,
      updatedAt: new Date(),
    };
    return examinations[index];
  }

  async findExaminationsByPatientAsync(
    patientId: number
  ): Promise<Examination[]> {
    return examinations.filter((exam) => exam.patientId === patientId);
  }

  async findExaminationsByDoctorAsync(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Examination[]> {
    return examinations.filter(
      (exam) =>
        exam.doctorId === doctorId &&
        exam.scheduledDate >= startDate &&
        exam.scheduledDate <= endDate
    );
  }

  async findPendingExaminationsAsync(): Promise<Examination[]> {
    return examinations.filter(
      (exam) => exam.status === "scheduled" || exam.status === "in_progress"
    );
  }
}

export const appointmentRepository = new AppointmentRepository();
