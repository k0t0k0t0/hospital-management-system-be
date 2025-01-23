import type { Appointment } from "../patient/patientModel";
import type { Examination } from "./staffModel";
import { Models } from "./staffSchema";
import { patientRepository } from "../patient/patientRepository";

export class AppointmentRepository {
  async findAllAsync(): Promise<Examination[]> {
    const examinations = await Models.Examination.find().lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async findByIdAsync(id: string): Promise<Examination | null> {
    const examination = await Models.Examination.findById(id).lean();
    return examination ? this.sanitizeExaminationData(examination) : null;
  }

  async createAsync(
    examination: Omit<Examination, "_id" | "status" | "createdAt" | "updatedAt">
  ): Promise<Examination> {
    const newExamination = new Models.Examination({
      ...examination,
      status: "scheduled",
    });
    await newExamination.save();
    return this.sanitizeExaminationData(newExamination.toObject());
  }

  async updateAsync(
    id: string,
    examinationData: Partial<Examination>
  ): Promise<Examination | null> {
    const updated = await Models.Examination.findByIdAndUpdate(
      id,
      { $set: examinationData },
      { new: true }
    ).lean();
    return updated ? this.sanitizeExaminationData(updated) : null;
  }

  async deleteAsync(id: string): Promise<boolean> {
    const result = await Models.Examination.findByIdAndDelete(id);
    return result !== null;
  }

  // Search methods
  async findByDoctorAndDateRangeAsync(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Examination[]> {
    const examinations = await Models.Examination.find({
      doctorId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async findByPatientAsync(patientId: string): Promise<Examination[]> {
    const examinations = await Models.Examination.find({ patientId }).lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async findPendingAsync(): Promise<Examination[]> {
    const examinations = await Models.Examination.find({
      status: {
        $in: ["scheduled", "in_progress"],
      },
    }).lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async findUpcomingByDoctorAsync(
    doctorId: string,
    fromDate: Date = new Date()
  ): Promise<Examination[]> {
    const examinations = await Models.Examination.find({
      doctorId,
      scheduledDate: { $gte: fromDate },
      status: "scheduled",
    })
      .sort({ scheduledDate: 1 })
      .lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  // Status update methods
  async updateStatusAsync(
    id: string,
    status: string,
    notes?: string
  ): Promise<Examination | null> {
    const update: any = { status };
    if (notes) update.notes = notes;
    if (status === "completed") update.completedAt = new Date();

    const updated = await Models.Examination.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    return updated ? this.sanitizeExaminationData(updated) : null;
  }

  // Sanitization helper method
  private sanitizeExaminationData(examination: any): Examination {
    return {
      ...examination,
      notes: examination.notes || undefined,
      diagnosis: examination.diagnosis || undefined,
      prescription: examination.prescription || undefined,
      completedAt: examination.completedAt || undefined,
      cancelReason: examination.cancelReason || undefined,
      followUpDate: examination.followUpDate || undefined,
    };
  }

  // Add these new methods:
  // async findByDoctorAndDateRange(
  //   doctorId: string,
  //   startDate: Date,
  //   endDate: Date
  // ): Promise<Appointment[]> {
  //   const appointments = await Models.Appointment.find({
  //     doctorId,
  //     dateTime: {
  //       $gte: startDate,
  //       $lte: endDate,
  //     },
  //   }).lean();

  //   return appointments.map(apt => ({
  //     ...apt,
  //     patientId: apt.patientId.toString(),
  //     doctorId: apt.doctorId.toString(),
  //   }));
  // }

  async findBusyDoctors(
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<string[]> {
    // Convert date and times to Date objects for comparison
    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0);

    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0);

    // Find appointments that overlap with the requested time slot
    const busyAppointments = await Models.Appointment.find({
      dateTime: {
        $lt: endDateTime,
      },
      $expr: {
        $gt: {
          $add: ["$dateTime", { $multiply: ["$duration", 60000] }], // Convert duration to milliseconds
        },
        startDateTime,
      },
      status: { $in: ["scheduled", "confirmed"] },
    }).lean();

    // Return array of unique doctor IDs
    return [...new Set(busyAppointments.map((apt) => apt.doctorId.toString()))];
  }

  async findExaminationsByDoctorAsync(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Examination[]> {
    const examinations = await Models.Examination.find({
      doctorId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async findExaminationByIdAsync(id: string): Promise<Examination | null> {
    const examination = await Models.Examination.findById(id).lean();
    return examination ? this.sanitizeExaminationData(examination) : null;
  }

  async findPendingExaminationsAsync(): Promise<Examination[]> {
    const examinations = await Models.Examination.find({
      status: "scheduled",
    }).lean();
    return examinations.map(this.sanitizeExaminationData);
  }

  async createExaminationAsync(
    examinationData: Omit<
      Examination,
      "_id" | "status" | "createdAt" | "updatedAt"
    >
  ): Promise<Examination> {
    const newExamination = new Models.Examination({
      ...examinationData,
      status: "scheduled",
    });
    await newExamination.save();
    return this.sanitizeExaminationData(newExamination.toObject());
  }

  async updateExaminationAsync(
    id: string,
    updateData: Partial<Examination>
  ): Promise<Examination | null> {
    const updated = await Models.Examination.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();
    return updated ? this.sanitizeExaminationData(updated) : null;
  }

  private sanitizeAppointmentData(apt: any): Appointment {
    return {
      ...apt,
      notes: apt.notes || undefined,
      cancelReason: apt.cancelReason || undefined,
      cancelledAt: apt.cancelledAt || undefined,
      patientId: apt.patientId.toString(),
      doctorId: apt.doctorId.toString(),
    };
  }

  async findByDoctorAndDateRange(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    // First get appointments
    const appointments = await Models.Appointment.find({
      doctorId,
      dateTime: { $gte: startDate, $lte: endDate },
    }).lean();

    // Get unique patient IDs from appointments
    const patientIds = [...new Set(appointments.map((apt) => apt.patientId))];

    // Get doctor and patients in parallel
    const [doctor, patients] = await Promise.all([
      Models.Doctor.findById(doctorId).select("firstName lastName").lean(),
      patientRepository.findManyByIds(patientIds),
    ]);

    // Create lookup maps for quick access
    const patientMap = new Map(patients.map((p) => [p.id, p]));

    // Enhance appointments with names
    return appointments.map((apt) => ({
      ...this.sanitizeAppointmentData(apt),
      doctor: {
        id: doctorId,
        firstName: doctor?.firstName || "",
        lastName: doctor?.lastName || "",
      },
      patient: {
        id: apt.patientId,
        firstName: patientMap.get(apt.patientId.toString())?.firstName || "",
        lastName: patientMap.get(apt.patientId.toString())?.lastName || "",
      },
    }));
  }
}

export const appointmentRepository = new AppointmentRepository();
