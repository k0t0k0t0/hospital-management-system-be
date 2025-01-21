import { authService } from "@/api/auth/authService";
import type {
  AdminStaff,
  Doctor,
  DoctorSchedule,
  EmergencyCase,
  EmergencyTeamMember,
  LabTechnician,
  LabTest,
  MedicalStaff,
  Nurse,
} from "@/api/staff/staffModel";
import { staffRepository } from "@/api/staff/staffRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import type { Appointment } from "../patient/patientModel";
import { appointmentRepository } from "./appointmentRepository";
import type { CreateExamination, Examination } from "./examModel";

export class StaffService {
  async findAll() {
    try {
      const staff = await staffRepository.findAllAsync();
      return ServiceResponse.success("Medical staff retrieved successfully", staff);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve medical staff", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findDoctors() {
    try {
      const doctors = await staffRepository.findDoctorsAsync();
      return ServiceResponse.success("Doctors retrieved successfully", doctors);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve doctors", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findNurses() {
    try {
      const nurses = await staffRepository.findNursesAsync();
      return ServiceResponse.success("Nurses retrieved successfully", nurses);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve nurses", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string) {
    try {
      const staff = await staffRepository.findByIdAsync(id);
      if (!staff) {
        return ServiceResponse.failure("Staff member not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Staff member retrieved successfully", staff);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve staff member", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create(staffData: Omit<MedicalStaff, "createdAt" | "updatedAt">) {
    try {
      // Hash the password before saving
      const hashedPassword = await authService.hashPassword(staffData.password);
      const staff = await staffRepository.createAsync({
        ...staffData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...staffWithoutPassword } = staff;
      return ServiceResponse.success("Staff member created successfully", staffWithoutPassword, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to create staff member", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, staffData: Partial<MedicalStaff>) {
    try {
      const staff = await staffRepository.updateAsync(id, staffData);
      if (!staff) {
        return ServiceResponse.failure("Staff member not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Staff member updated successfully", staff);
    } catch (error) {
      return ServiceResponse.failure("Failed to update staff member", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string) {
    try {
      const success = await staffRepository.deleteAsync(id);
      if (!success) {
        return ServiceResponse.failure("Staff member not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Staff member deleted successfully", null);
    } catch (error) {
      return ServiceResponse.failure("Failed to delete staff member", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Additional methods specific to doctors and nurses
  async getDoctorAvailability(doctorId: string) {
    try {
      const staff = await staffRepository.findByIdAsync(doctorId);
      if (!staff || staff.role !== "doctor") {
        return ServiceResponse.failure("Doctor not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Doctor availability retrieved successfully", staff.availability);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve doctor availability", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDoctorAvailability(doctorId: string, availability: Doctor["availability"]) {
    try {
      const staff = await staffRepository.findByIdAsync(doctorId);
      if (!staff || staff.role !== "doctor") {
        return ServiceResponse.failure("Doctor not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStaff = await staffRepository.updateAsync(doctorId, {
        ...staff,
        availability,
      });

      return ServiceResponse.success("Doctor availability updated successfully", updatedStaff);
    } catch (error) {
      return ServiceResponse.failure("Failed to update doctor availability", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateNurseShift(nurseId: string, shift: Nurse["shift"]) {
    try {
      const staff = await staffRepository.findByIdAsync(nurseId);
      if (!staff || staff.role !== "nurse") {
        return ServiceResponse.failure("Nurse not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStaff = await staffRepository.updateAsync(nurseId, {
        ...staff,
        shift,
      });

      return ServiceResponse.success("Nurse shift updated successfully", updatedStaff);
    } catch (error) {
      return ServiceResponse.failure("Failed to update nurse shift", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Admin-specific methods
  async findAdminStaff() {
    try {
      const adminStaff = await staffRepository.findAdminStaffAsync();
      return ServiceResponse.success("Administrative staff retrieved successfully", adminStaff);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to retrieve administrative staff",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findStaffByDepartment(department: string) {
    try {
      const staff = await staffRepository.findStaffByDepartmentAsync(department);
      if (!staff || staff.length === 0) {
        return ServiceResponse.failure(`No staff found for department: ${department}`, null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Staff retrieved successfully", staff);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve staff by department", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAdminAccess(adminId: string, accessLevel: AdminStaff["accessLevel"]) {
    try {
      const staff = await staffRepository.findByIdAsync(adminId);
      if (!staff || staff.role !== "admin") {
        return ServiceResponse.failure("Administrative staff member not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStaff = await staffRepository.updateAsync(adminId, {
        ...staff,
        accessLevel,
      });

      return ServiceResponse.success("Administrative staff access level updated successfully", updatedStaff);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to update administrative staff access level",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateManagedDepartments(adminId: string, departments: string[]) {
    try {
      const staff = await staffRepository.findByIdAsync(adminId);
      if (!staff || staff.role !== "admin") {
        return ServiceResponse.failure("Administrative staff member not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStaff = await staffRepository.updateAsync(adminId, {
        ...staff,
        managedDepartments: departments,
      });

      return ServiceResponse.success("Managed departments updated successfully", updatedStaff);
    } catch (error) {
      return ServiceResponse.failure("Failed to update managed departments", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateResponsibilities(adminId: string, responsibilities: string[]) {
    try {
      const staff = await staffRepository.findByIdAsync(adminId);
      if (!staff || staff.role !== "admin") {
        return ServiceResponse.failure("Administrative staff member not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedStaff = await staffRepository.updateAsync(adminId, {
        ...staff,
        responsibilities,
      });

      return ServiceResponse.success("Responsibilities updated successfully", updatedStaff);
    } catch (error) {
      return ServiceResponse.failure("Failed to update responsibilities", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Emergency Team methods
  async findEmergencyTeam() {
    try {
      const team = await staffRepository.findEmergencyTeamAsync();
      return ServiceResponse.success("Emergency team retrieved successfully", team);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve emergency team", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findAvailableEmergencyTeam() {
    try {
      const team = await staffRepository.findAvailableEmergencyTeamAsync();
      if (!team.length) {
        return ServiceResponse.failure("No available emergency team members found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Available emergency team retrieved successfully", team);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to retrieve available emergency team",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createEmergencyCase(
    caseData: Omit<EmergencyCase, "_id" | "createdAt" | "updatedAt" | "assignedTeamMembers" | "status">,
  ) {
    try {
      // Find available team members qualified for the triage level
      const availableTeam = await staffRepository.findEmergencyTeamByTriageLevelAsync(caseData.severity);

      if (!availableTeam.length) {
        return ServiceResponse.failure("No qualified emergency team members available", null, StatusCodes.NOT_FOUND);
      }

      const emergencyCase = await staffRepository.createEmergencyCaseAsync({
        ...caseData,
        assignedTeamMembers: availableTeam.map((member) => member.id),
        status: "pending",
      });

      return ServiceResponse.success("Emergency case created successfully", emergencyCase, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to create emergency case", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateEmergencyCaseStatus(caseId: string, status: EmergencyCase["status"]) {
    try {
      const existingCase = await staffRepository.findEmergencyCaseByIdAsync(caseId);

      if (!existingCase) {
        return ServiceResponse.failure("Emergency case not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedCase = await staffRepository.updateEmergencyCaseAsync(caseId, {
        status,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      });

      return ServiceResponse.success("Emergency case status updated successfully", updatedCase);
    } catch (error) {
      return ServiceResponse.failure("Failed to update emergency case status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async reassignEmergencyTeam(caseId: string, teamMemberIds: string[]) {
    try {
      const existingCase = await staffRepository.findEmergencyCaseByIdAsync(caseId);

      if (!existingCase) {
        return ServiceResponse.failure("Emergency case not found", null, StatusCodes.NOT_FOUND);
      }

      // Verify all team members exist and are emergency staff
      const teamMembers = await Promise.all(teamMemberIds.map((id) => staffRepository.findByIdAsync(id)));

      if (teamMembers.some((member) => !member || member.role !== "emergency")) {
        return ServiceResponse.failure("Invalid team member assignments", null, StatusCodes.BAD_REQUEST);
      }

      const updatedCase = await staffRepository.updateEmergencyCaseAsync(caseId, {
        assignedTeamMembers: teamMemberIds,
      });

      return ServiceResponse.success("Emergency team reassigned successfully", updatedCase);
    } catch (error) {
      return ServiceResponse.failure("Failed to reassign emergency team", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getActiveEmergencyCases() {
    try {
      const cases = await staffRepository.findActiveEmergencyCasesAsync();
      return ServiceResponse.success("Active emergency cases retrieved successfully", cases);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to retrieve active emergency cases",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEmergencyTeamMemberStatus(memberId: string, activeShift: boolean) {
    try {
      const member = await staffRepository.findByIdAsync(memberId);

      if (!member || member.role !== "emergency") {
        return ServiceResponse.failure("Emergency team member not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedMember = await staffRepository.updateAsync(memberId, {
        ...member,
        activeShift,
        lastEmergencyResponse: activeShift ? undefined : new Date(),
      });

      return ServiceResponse.success("Team member status updated successfully", updatedMember);
    } catch (error) {
      return ServiceResponse.failure("Failed to update team member status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lab Technician methods
  async findLabTechnicians() {
    try {
      const technicians = await staffRepository.findLabTechniciansAsync();
      return ServiceResponse.success("Lab technicians retrieved successfully", technicians);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve lab technicians", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findAvailableLabTechnicians(testType: string) {
    try {
      const technicians = await staffRepository.findAvailableLabTechniciansAsync(testType);
      if (!technicians.length) {
        return ServiceResponse.failure(
          "No available lab technicians found for this test type",
          null,
          StatusCodes.NOT_FOUND,
        );
      }
      return ServiceResponse.success("Available lab technicians retrieved successfully", technicians);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to retrieve available lab technicians",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createLabTest(testData: Omit<LabTest, "id" | "createdAt" | "updatedAt" | "status" | "technicianId">) {
    try {
      // Find available technician for the test type
      const availableTechs = await staffRepository.findAvailableLabTechniciansAsync(testData.testType);

      const labTest = await staffRepository.createLabTestAsync({
        ...testData,
        technicianId: availableTechs[0]?.id, // Assign first available technician if any
        status: "pending",
      });

      return ServiceResponse.success("Lab test created successfully", labTest, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to create lab test", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateLabTestStatus(testId: string, status: LabTest["status"], results?: LabTest["results"]) {
    try {
      const existingTest = await staffRepository.findLabTestByIdAsync(testId);

      if (!existingTest) {
        return ServiceResponse.failure("Lab test not found", null, StatusCodes.NOT_FOUND);
      }

      const updateData: Partial<LabTest> = {
        status,
        completedAt: status === "completed" ? new Date() : undefined,
        results: status === "completed" ? results : undefined,
      };

      const updatedTest = await staffRepository.updateLabTestAsync(testId, updateData);
      return ServiceResponse.success("Lab test status updated successfully", updatedTest);
    } catch (error) {
      return ServiceResponse.failure("Failed to update lab test status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async reassignLabTechnician(testId: string, technicianId: string) {
    try {
      const [existingTest, technician] = await Promise.all([
        staffRepository.findLabTestByIdAsync(testId),
        staffRepository.findByIdAsync(technicianId),
      ]);

      if (!existingTest) {
        return ServiceResponse.failure("Lab test not found", null, StatusCodes.NOT_FOUND);
      }

      if (!technician || technician.role !== "lab_technician") {
        return ServiceResponse.failure("Invalid lab technician", null, StatusCodes.BAD_REQUEST);
      }

      const updatedTest = await staffRepository.updateLabTestAsync(testId, {
        technicianId,
      });
      return ServiceResponse.success("Lab technician reassigned successfully", updatedTest);
    } catch (error) {
      return ServiceResponse.failure("Failed to reassign lab technician", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getPatientLabTests(patientId: string) {
    try {
      const tests = await staffRepository.findLabTestsByPatientAsync(patientId);
      return ServiceResponse.success("Patient lab tests retrieved successfully", tests);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve patient lab tests", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingLabTests() {
    try {
      const tests = await staffRepository.findPendingLabTestsAsync();
      return ServiceResponse.success("Pending lab tests retrieved successfully", tests);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve pending lab tests", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateLabTechnicianStatus(technicianId: string, activeShift: boolean) {
    try {
      const technician = await staffRepository.findByIdAsync(technicianId);

      if (!technician || technician.role !== "lab_technician") {
        return ServiceResponse.failure("Lab technician not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedTechnician = await staffRepository.updateAsync(technicianId, {
        ...technician,
        activeShift,
      });

      return ServiceResponse.success("Lab technician status updated successfully", updatedTechnician);
    } catch (error) {
      return ServiceResponse.failure("Failed to update lab technician status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDoctorSchedule(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ServiceResponse<DoctorSchedule[]>> {
    try {
      const doctor = await staffRepository.findByIdAsync(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return ServiceResponse.failure("Doctor not found", [], StatusCodes.NOT_FOUND);
      }

      // Get doctor's base availability
      const baseSchedule = doctor.availability;

      // Get all appointments in the date range
      const appointments = await appointmentRepository.findByDoctorAndDateRange(doctorId, startDate, endDate);

      // Generate schedule for each day in the range
      const schedule: DoctorSchedule[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayName = new Date(currentDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const daySchedule = baseSchedule.find((s) => s.day === dayName);

        if (daySchedule) {
          const timeSlots = this.generateTimeSlots(
            currentDate,
            daySchedule.startTime,
            daySchedule.endTime,
            appointments,
          );

          schedule.push({
            doctorId,
            date: currentDate.toISOString().split("T")[0],
            timeSlots,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return ServiceResponse.success("Doctor schedule retrieved successfully", schedule);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve doctor schedule", [], StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableDoctors({
    date,
    startTime,
    endTime,
    department,
    specialization,
  }: {
    date: Date;
    startTime: string;
    endTime: string;
    department?: string;
    specialization?: string;
  }): Promise<ServiceResponse<Doctor[]>> {
    try {
      // Get all doctors
      let doctors = await staffRepository.findDoctors({
        department,
        specialization,
      });

      // Filter doctors by availability on the specified day
      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      doctors = doctors.filter((doctor) => {
        const daySchedule = doctor.availability.find((s) => s.day === dayName);
        if (!daySchedule) return false;

        // Check if the requested time slot falls within doctor's working hours
        return this.isTimeSlotWithinRange(startTime, endTime, daySchedule.startTime, daySchedule.endTime);
      });

      // Check existing appointments to filter out busy doctors
      const busyDoctorIds = await appointmentRepository.findBusyDoctors(date, startTime, endTime);

      doctors = doctors.filter((doctor) => !busyDoctorIds.includes(doctor.id));

      return ServiceResponse.success("Available doctors retrieved successfully", doctors);
    } catch (error) {
      return ServiceResponse.success("No doctors available", []);
    }
  }

  private generateTimeSlots(
    date: Date,
    startTime: string,
    endTime: string,
    appointments: Appointment[],
  ): Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    appointmentId?: string;
  }> {
    const slots = [];
    const [startHour] = startTime.split(":").map(Number);
    const [endHour] = endTime.split(":").map(Number);

    // Generate 30-minute slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotEnd =
          minute === 30 ? `${(hour + 1).toString().padStart(2, "0")}:00` : `${hour.toString().padStart(2, "0")}:30`;

        const conflictingAppointment = appointments.find((apt) =>
          this.isTimeSlotConflicting(date, slotStart, slotEnd, apt.dateTime, apt.duration),
        );

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: !conflictingAppointment,
          appointmentId: conflictingAppointment?._id,
        });
      }
    }

    return slots;
  }

  private isTimeSlotWithinRange(slotStart: string, slotEnd: string, rangeStart: string, rangeEnd: string): boolean {
    const [slotStartHour, slotStartMin] = slotStart.split(":").map(Number);
    const [slotEndHour, slotEndMin] = slotEnd.split(":").map(Number);
    const [rangeStartHour, rangeStartMin] = rangeStart.split(":").map(Number);
    const [rangeEndHour, rangeEndMin] = rangeEnd.split(":").map(Number);

    const slotStartMins = slotStartHour * 60 + slotStartMin;
    const slotEndMins = slotEndHour * 60 + slotEndMin;
    const rangeStartMins = rangeStartHour * 60 + rangeStartMin;
    const rangeEndMins = rangeEndHour * 60 + rangeEndMin;

    return slotStartMins >= rangeStartMins && slotEndMins <= rangeEndMins;
  }

  private isTimeSlotConflicting(
    date: Date,
    slotStart: string,
    slotEnd: string,
    appointmentDateTime: Date,
    appointmentDuration: number,
  ): boolean {
    const slotDate = new Date(date);
    const [slotStartHour, slotStartMin] = slotStart.split(":").map(Number);
    const [slotEndHour, slotEndMin] = slotEnd.split(":").map(Number);

    const slotStartTime = new Date(slotDate.setHours(slotStartHour, slotStartMin));
    const slotEndTime = new Date(slotDate.setHours(slotEndHour, slotEndMin));

    const appointmentEndTime = new Date(appointmentDateTime.getTime() + appointmentDuration * 60000);

    return appointmentDateTime < slotEndTime && appointmentEndTime > slotStartTime;
  }

  async createExamination(examinationData: CreateExamination) {
    try {
      // Verify doctor availability
      const isAvailable = await this.checkDoctorAvailability(examinationData.doctorId, examinationData.scheduledDate);

      if (!isAvailable) {
        return ServiceResponse.failure("Doctor is not available at the requested time", null, StatusCodes.BAD_REQUEST);
      }

      const examination = await appointmentRepository.createExaminationAsync(examinationData);

      return ServiceResponse.success("Examination scheduled successfully", examination, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to schedule examination", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateExaminationStatus(
    id: string,
    status: Examination["status"],
    results?: Examination["results"],
    cancelReason?: string,
  ) {
    try {
      const examination = await appointmentRepository.findExaminationByIdAsync(id);
      if (!examination) {
        return ServiceResponse.failure("Examination not found", null, StatusCodes.NOT_FOUND);
      }

      const updateData: Partial<Examination> = {
        status,
        ...(status === "completed" && {
          completedAt: new Date(),
          results,
        }),
        ...(status === "cancelled" && {
          cancelledAt: new Date(),
          cancelReason,
        }),
      };

      const updatedExamination = await appointmentRepository.updateExaminationAsync(id, updateData);

      return ServiceResponse.success("Examination status updated successfully", updatedExamination);
    } catch (error) {
      return ServiceResponse.failure("Failed to update examination status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getDoctorExaminations(doctorId: string, startDate: Date, endDate: Date) {
    try {
      const examinations = await appointmentRepository.findExaminationsByDoctorAsync(doctorId, startDate, endDate);
      return ServiceResponse.success("Doctor examinations retrieved successfully", examinations);
    } catch (error) {
      return ServiceResponse.failure("Failed to retrieve doctor examinations", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingExaminations() {
    try {
      const examinations = await appointmentRepository.findPendingExaminationsAsync();
      return ServiceResponse.success("Pending examinations retrieved successfully", examinations);
    } catch (error) {
      return ServiceResponse.failure(
        "Failed to retrieve pending examinations",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkDoctorAvailability(doctorId: string, dateTime: Date): Promise<boolean> {
    const doctor = await staffRepository.findByIdAsync(doctorId);
    if (!doctor || doctor.role !== "doctor") return false;

    const dayName = new Date(dateTime).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const daySchedule = doctor.availability.find((s) => s.day === dayName);
    if (!daySchedule) return false;

    const appointmentTime = dateTime.getHours() + dateTime.getMinutes() / 60;
    const [startHour, startMinute] = daySchedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);
    const startTime = startHour + startMinute / 60;
    const endTime = endHour + endMinute / 60;

    return appointmentTime >= startTime && appointmentTime + 0.5 <= endTime;
  }
}

export const staffService = new StaffService();
