import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { Models } from "../staff/staffSchema";
import { PatientModel } from "../patient/patientModel";
import { logError } from "@/common/utils/errorLogger";

export class StatsService {
  async getStats() {
    try {
      const [
        totalPatients,
        totalDoctors,
        totalNurses,
        totalEmergencyTeam,
        totalLabTechs,
        totalWards,
        // upcomingAppointments,
      ] = await Promise.all([
        PatientModel.countDocuments(),
        Models.Doctor.countDocuments(),
        Models.Nurse.countDocuments(),
        Models.EmergencyTeamMember.countDocuments(),
        Models.LabTechnician.countDocuments(),
        // Models.Ward.countDocuments(),
        Models.Appointment.countDocuments({
          dateTime: { $gte: new Date() },
          status: "scheduled",
        }),
      ]);

      const stats = {
        totalPatients,
        totalDoctors,
        totalNurses,
        totalEmergencyTeam,
        totalLabTechnicians: totalLabTechs,
        totalWards,
        upcomingAppointments,
      };

      return ServiceResponse.success("Stats retrieved successfully", stats);
    } catch (error) {
      logError("StatsService.getStats", error);
      return ServiceResponse.failure(
        "Failed to retrieve stats",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const statsService = new StatsService();
