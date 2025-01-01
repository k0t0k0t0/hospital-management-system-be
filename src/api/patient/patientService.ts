import type {
  Appointment,
  EmergencyContact,
  EmergencyVisit,
  Message,
  Patient,
} from "@/api/patient/patientModel";
import { patientRepository } from "@/api/patient/patientRepository";
import { staffRepository } from "@/api/staff/staffRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import type { Doctor } from "../staff/staffModel";

export class PatientService {
  async findAll() {
    try {
      const patients = await patientRepository.findAllAsync();
      return ServiceResponse.success(
        "Patients retrieved successfully",
        patients
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string) {
    try {
      const patient = await patientRepository.findByIdAsync(id);
      if (!patient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success("Patient retrieved successfully", patient);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async create(patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">) {
    try {
      const patient = await patientRepository.createAsync(patientData);
      return ServiceResponse.success(
        "Patient created successfully",
        patient,
        StatusCodes.CREATED
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, patientData: Partial<Patient>) {
    try {
      const patient = await patientRepository.updateAsync(id, patientData);
      if (!patient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success("Patient updated successfully", patient);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string) {
    try {
      const success = await patientRepository.deleteAsync(id);
      if (!success) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success("Patient deleted successfully", null);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createAppointment(
    appointmentData: Omit<
      Appointment,
      "id" | "status" | "createdAt" | "updatedAt"
    >
  ) {
    try {
      // Verify doctor availability
      const doctor = await staffRepository.findByIdAsync(
        appointmentData.doctorId
      );
      if (!doctor || doctor.role !== "doctor") {
        return ServiceResponse.failure(
          "Doctor not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Check doctor's availability for the requested time
      const isAvailable = await this.checkDoctorAvailability(
        appointmentData.doctorId,
        appointmentData.dateTime
      );
      if (!isAvailable) {
        return ServiceResponse.failure(
          "Doctor is not available at the requested time",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const appointment = await patientRepository.createAppointmentAsync(
        appointmentData
      );
      return ServiceResponse.success(
        "Appointment created successfully",
        appointment
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async rescheduleAppointment(id: string, newDateTime: Date) {
    try {
      const appointment = await patientRepository.findAppointmentByIdAsync(id);
      if (!appointment) {
        return ServiceResponse.failure(
          "Appointment not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Check doctor's availability for the new time
      const isAvailable = await this.checkDoctorAvailability(
        appointment.doctorId,
        newDateTime
      );
      if (!isAvailable) {
        return ServiceResponse.failure(
          "Doctor is not available at the requested time",
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedAppointment = await patientRepository.updateAppointmentAsync(
        id,
        {
          dateTime: newDateTime,
          updatedAt: new Date(),
        }
      );

      return ServiceResponse.success(
        "Appointment rescheduled successfully",
        updatedAppointment
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async checkDoctorAvailability(
    doctorId: string,
    dateTime: Date
  ): Promise<boolean> {
    const doctor = (await staffRepository.findByIdAsync(doctorId)) as Doctor;
    if (!doctor) return false;

    const dayOfWeek = dateTime.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    const daySchedule = doctor.availability.find((a) => a.day === dayName);
    if (!daySchedule) return false;

    const appointmentTime = dateTime.getHours() + dateTime.getMinutes() / 60;
    const [startHour, startMinute] = daySchedule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);
    const startTime = startHour + startMinute / 60;
    const endTime = endHour + endMinute / 60;

    return appointmentTime >= startTime && appointmentTime + 0.5 <= endTime;
  }

  async updateAppointmentStatus(
    id: string,
    status: Appointment["status"],
    cancelReason?: string
  ) {
    try {
      const appointment = await patientRepository.findAppointmentByIdAsync(id);
      if (!appointment) {
        return ServiceResponse.failure(
          "Appointment not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const updateData: Partial<Appointment> = {
        status,
        ...(status === "cancelled" && {
          cancelledAt: new Date(),
          cancelReason,
        }),
      };

      const updatedAppointment = await patientRepository.updateAppointmentAsync(
        id,
        updateData
      );
      return ServiceResponse.success(
        "Appointment status updated successfully",
        updatedAppointment
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPatientAppointments(patientId: string) {
    try {
      const appointments =
        await patientRepository.findAppointmentsByPatientAsync(patientId);
      return ServiceResponse.success(
        "Patient appointments retrieved successfully",
        appointments
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUpcomingAppointments(patientId: string) {
    try {
      const appointments =
        await patientRepository.findUpcomingAppointmentsAsync(patientId);
      return ServiceResponse.success(
        "Upcoming appointments retrieved successfully",
        appointments
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createMessage(
    messageData: Omit<
      Message,
      "id" | "status" | "createdAt" | "updatedAt" | "readAt"
    >
  ) {
    try {
      const message = await patientRepository.createMessageAsync(messageData);
      return ServiceResponse.success(
        "Message sent successfully",
        message,
        StatusCodes.CREATED
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPatientMessages(patientId: string) {
    try {
      const messages = await patientRepository.findMessagesByPatientAsync(
        patientId
      );
      return ServiceResponse.success(
        "Messages retrieved successfully",
        messages
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUnreadMessages(patientId: string) {
    try {
      const messages = await patientRepository.findUnreadMessagesAsync(
        patientId
      );
      return ServiceResponse.success(
        "Unread messages retrieved successfully",
        messages
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markMessageAsRead(messageId: string) {
    try {
      const message = await patientRepository.markMessageAsReadAsync(messageId);
      if (!message) {
        return ServiceResponse.failure(
          "Message not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        "Message marked as read successfully",
        message
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchPatients(searchParams: {
    firstName?: string;
    lastName?: string;
    email?: string;
    contactNumber?: string;
  }) {
    try {
      const patients = await patientRepository.searchPatientsAsync(
        searchParams
      );
      return ServiceResponse.success(
        "Patients retrieved successfully",
        patients
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        console.log(error);
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEmergencyInfo(patientId: string) {
    try {
      const patient = await patientRepository.findByIdAsync(patientId);
      if (!patient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Compile critical emergency information
      const emergencyInfo = {
        patientInfo: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          bloodType: patient.bloodType,
          allergies: patient.allergies,
        },
        emergencyContact: patient.emergencyContact,
        medicalHistory: {
          chronicConditions: patient.chronicConditions,
          currentMedications: patient.currentMedications,
          recentProcedures: patient.recentProcedures,
        },
        insuranceInfo: patient.insuranceInfo,
        lastEmergencyVisit: await patientRepository.getLastEmergencyVisit(
          patientId
        ),
      };

      return ServiceResponse.success(
        "Emergency information retrieved",
        emergencyInfo
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEmergencyContact(
    patientId: string,
    contactInfo: EmergencyContact
  ) {
    try {
      const patient = await patientRepository.findByIdAsync(patientId);
      if (!patient) {
        return ServiceResponse.failure(
          "Patient not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const updatedPatient = await patientRepository.updateAsync(patientId, {
        emergencyContact: contactInfo,
        updatedAt: new Date(),
      });

      return ServiceResponse.success(
        "Emergency contact updated",
        updatedPatient
      );
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async recordEmergencyVisit(visitData: EmergencyVisit) {
    try {
      // Notify relevant staff
      // await this.notifyEmergencyStaff(visitData);

      // Record the emergency visit
      const visit = await patientRepository.createEmergencyVisitAsync(
        visitData
      );

      // Update patient's last emergency visit
      await patientRepository.updateAsync(visitData.patientId, {
        lastEmergencyVisit: new Date(),
        updatedAt: new Date(),
      });

      return ServiceResponse.success("Emergency visit recorded", visit);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return ServiceResponse.failure(
          "Validation error",
          error.errors,
          StatusCodes.BAD_REQUEST
        );
      }
      if (error instanceof mongoose.Error.CastError) {
        return ServiceResponse.failure(
          "Invalid ID format",
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      return ServiceResponse.failure(
        "Internal server error",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // private async notifyEmergencyStaff(visitData: EmergencyVisit) {
  //   // Get available emergency staff
  //   const emergencyStaff = await staffRepository.getAvailableEmergencyStaff();

  //   // Send notifications (implement your notification system here)
  //   for (const staff of emergencyStaff) {
  //     await notificationService.sendUrgentNotification({
  //       to: staff.id,
  //       type: "EMERGENCY",
  //       patientId: visitData.patientId,
  //       severity: visitData.severity,
  //       location: visitData.location,
  //       description: visitData.description,
  //     });
  //   }
  // }
}

export const patientService = new PatientService();
