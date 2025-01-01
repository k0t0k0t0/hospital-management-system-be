import type { Model } from "mongoose";
import type { Doctor, EmergencyTeamMember, LabTechnician, LabTest, MedicalStaff, Nurse } from "./staffModel";
import { Models } from "./staffSchema";

export class StaffRepository {
  private ModelMap: Record<MedicalStaff["role"], Model<any>> = {
    doctor: Models.Doctor,
    nurse: Models.Nurse,
    admin: Models.AdminStaff,
    emergency: Models.EmergencyTeamMember,
    lab_technician: Models.LabTechnician,
  };

  async findAllAsync(): Promise<MedicalStaff[]> {
    const [doctors, nurses, admins, emergency, labTechs] = await Promise.all([
      Models.Doctor.find().lean(),
      Models.Nurse.find().lean(),
      Models.AdminStaff.find().lean(),
      Models.EmergencyTeamMember.find().lean(),
      Models.LabTechnician.find().lean(),
    ]);
    return [...doctors, ...nurses, ...admins, ...emergency, ...labTechs].map(this.sanitizeStaffData);
  }

  async findByIdAsync(id: string): Promise<MedicalStaff | null> {
    try {
      const staff = await Promise.any([
        Models.Doctor.findById(id).lean(),
        Models.Nurse.findById(id).lean(),
        Models.AdminStaff.findById(id).lean(),
        Models.EmergencyTeamMember.findById(id).lean(),
        Models.LabTechnician.findById(id).lean(),
      ]);
      return staff ? this.sanitizeStaffData(staff) : null;
    } catch {
      return null;
    }
  }

  async createAsync(staff: Omit<MedicalStaff, "createdAt" | "updatedAt">): Promise<MedicalStaff> {
    const Model = this.ModelMap[staff.role];
    if (!Model) throw new Error("Invalid staff role");

    const newStaff = new Model(staff);
    await newStaff.save();
    return this.sanitizeStaffData(newStaff.toObject());
  }

  async updateAsync(id: string, staffData: Partial<MedicalStaff>): Promise<MedicalStaff | null> {
    const currentStaff = await this.findByIdAsync(id);
    if (!currentStaff) return null;

    const updated = await this.ModelMap[currentStaff.role]
      .findByIdAndUpdate(id, { $set: staffData }, { new: true })
      .lean();

    return updated ? this.sanitizeStaffData(updated) : null;
  }

  async deleteAsync(id: string): Promise<boolean> {
    const currentStaff = await this.findByIdAsync(id);
    if (!currentStaff) return false;

    const result = await this.ModelMap[currentStaff.role].findByIdAndDelete(id);
    return result !== null;
  }

  // Emergency team methods
  async findEmergencyTeamAsync(): Promise<EmergencyTeamMember[]> {
    const team = await Models.EmergencyTeamMember.find().lean();
    return team.map(this.sanitizeEmergencyTeamData);
  }

  async findAvailableEmergencyTeamAsync(): Promise<EmergencyTeamMember[]> {
    const team = await Models.EmergencyTeamMember.find({
      activeShift: true,
    }).lean();
    return team.map(this.sanitizeEmergencyTeamData);
  }

  // Lab-related methods
  async findLabTestsAsync(options?: {
    patientId?: string;
    status?: string[];
  }): Promise<LabTest[]> {
    const query: any = {};
    if (options?.patientId) query.patientId = options.patientId;
    if (options?.status) query.status = { $in: options.status };

    const tests = await Models.LabTest.find(query).lean();
    return tests.map(this.sanitizeLabTestData);
  }

  async createLabTestAsync(testData: Omit<LabTest, "_id" | "createdAt" | "updatedAt">): Promise<LabTest> {
    const newTest = new Models.LabTest(testData);
    await newTest.save();
    return this.sanitizeLabTestData(newTest.toObject());
  }

  // Search methods
  async findDoctorsAsync(params?: {
    department?: string;
    specialization?: string;
  }): Promise<Doctor[]> {
    const query: Record<string, any> = {};
    if (params?.department) query.department = params.department;
    if (params?.specialization) query.specialization = params.specialization;

    const doctors = await Models.Doctor.find(query).lean();
    return doctors.map(this.sanitizeDoctorData);
  }

  // Sanitization helper methods
  private sanitizeStaffData(staff: any): MedicalStaff {
    const baseFields = {
      ...staff,
      contactNumber: staff.contactNumber || undefined,
      address: staff.address || undefined,
      department: staff.department || undefined,
    };

    switch (staff.role) {
      case "doctor":
        return this.sanitizeDoctorData(baseFields);
      case "nurse":
        return this.sanitizeNurseData(baseFields);
      case "emergency":
        return this.sanitizeEmergencyTeamData(baseFields);
      case "lab_technician":
        return this.sanitizeLabTechnicianData(baseFields);
      default:
        return baseFields;
    }
  }

  private sanitizeDoctorData(doctor: any): Doctor {
    return {
      ...doctor,
      specialization: doctor.specialization || undefined,
      availability: doctor.availability || undefined,
      licenseNumber: doctor.licenseNumber || undefined,
    };
  }

  private sanitizeNurseData(nurse: any): Nurse {
    return {
      ...nurse,
      shift: nurse.shift || undefined,
      certificationNumber: nurse.certificationNumber || undefined,
    };
  }

  private sanitizeEmergencyTeamData(member: any): EmergencyTeamMember {
    return {
      ...member,
      specializedTraining: member.specializedTraining || undefined,
      certifications: member.certifications || undefined,
      lastEmergencyResponse: member.lastEmergencyResponse || undefined,
      responseTeamId: member.responseTeamId || undefined,
    };
  }

  private sanitizeLabTechnicianData(tech: any): LabTechnician {
    return {
      ...tech,
      specialization: tech.specialization || undefined,
      certifications: tech.certifications || undefined,
    };
  }

  private sanitizeLabTestData(test: any): LabTest {
    return {
      ...test,
      notes: test.notes || undefined,
      results: test.results || undefined,
      completedAt: test.completedAt || undefined,
    };
  }

  // Doctor-specific methods
  async findDoctors(params?: {
    department?: string;
    specialization?: string;
  }): Promise<Doctor[]> {
    const query: Record<string, any> = { role: "doctor" };
    if (params?.department) query.department = params.department;
    if (params?.specialization) query.specialization = params.specialization;

    const doctors = await Models.Doctor.find(query).lean();
    return doctors.map(this.sanitizeDoctorData);
  }

  async findNursesAsync(): Promise<Nurse[]> {
    const nurses = await Models.Nurse.find().lean();
    return nurses.map(this.sanitizeNurseData);
  }

  async findAdminStaffAsync() {
    const adminStaff = await Models.AdminStaff.find().lean();
    return adminStaff;
  }

  async findStaffByDepartmentAsync(department: string): Promise<MedicalStaff[]> {
    const [doctors, nurses, admins] = await Promise.all([
      Models.Doctor.find({ department }).lean(),
      Models.Nurse.find({ department }).lean(),
      Models.AdminStaff.find({ department }).lean(),
    ]);
    return [...doctors, ...nurses, ...admins].map(this.sanitizeStaffData);
  }

  // Emergency team methods
  async findEmergencyTeamByTriageLevelAsync(triageLevel: string): Promise<EmergencyTeamMember[]> {
    const team = await Models.EmergencyTeamMember.find({
      activeShift: true,
      "specializedTraining.triageLevel": triageLevel,
    }).lean();
    return team.map(this.sanitizeEmergencyTeamData);
  }

  async findEmergencyCaseByIdAsync(caseId: string) {
    return await Models.EmergencyCase.findById(caseId).lean();
  }

  async createEmergencyCaseAsync(caseData: any) {
    const newCase = new Models.EmergencyCase(caseData);
    await newCase.save();
    return newCase.toObject();
  }

  async updateEmergencyCaseAsync(caseId: string, updateData: any) {
    return await Models.EmergencyCase.findByIdAndUpdate(caseId, { $set: updateData }, { new: true }).lean();
  }

  async findActiveEmergencyCasesAsync() {
    return await Models.EmergencyCase.find({
      status: { $in: ["pending", "in_progress"] },
    }).lean();
  }

  // Lab-related methods
  async findLabTechniciansAsync(): Promise<LabTechnician[]> {
    const technicians = await Models.LabTechnician.find().lean();
    return technicians.map(this.sanitizeLabTechnicianData);
  }

  async findAvailableLabTechniciansAsync(testType: string): Promise<LabTechnician[]> {
    const technicians = await Models.LabTechnician.find({
      activeShift: true,
      "specialization.testTypes": testType,
    }).lean();
    return technicians.map(this.sanitizeLabTechnicianData);
  }

  async findLabTestByIdAsync(testId: string) {
    return await Models.LabTest.findById(testId).lean();
  }

  async updateLabTestAsync(testId: string, updateData: any) {
    return await Models.LabTest.findByIdAndUpdate(testId, { $set: updateData }, { new: true }).lean();
  }

  async findLabTestsByPatientAsync(patientId: string) {
    const tests = await Models.LabTest.find({ patientId }).lean();
    return tests.map(this.sanitizeLabTestData);
  }

  async findPendingLabTestsAsync() {
    const tests = await Models.LabTest.find({
      status: "scheduled",
    }).lean();
    return tests.map(this.sanitizeLabTestData);
  }

  // Appointment-related methods
  async findByDoctorAndDateRange(doctorId: string, startDate: Date, endDate: Date) {
    return await Models.Appointment.find({
      doctorId,
      dateTime: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
  }

  async findBusyDoctors(date: Date, startTime: string, endTime: string): Promise<string[]> {
    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0);

    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0);

    const busyAppointments = await Models.Appointment.find({
      dateTime: {
        $lt: endDateTime,
        $gt: startDateTime,
      },
    })
      .distinct("doctorId")
      .lean();

    return busyAppointments.map((id) => id.toString());
  }

  // Examination-related methods
  async createExaminationAsync(examinationData: any) {
    const examination = new Models.Examination(examinationData);
    await examination.save();
    return examination.toObject();
  }

  async findExaminationByIdAsync(id: string) {
    return await Models.Examination.findById(id).lean();
  }

  async updateExaminationAsync(id: string, updateData: any) {
    return await Models.Examination.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
  }

  async findExaminationsByDoctorAsync(doctorId: string, startDate: Date, endDate: Date) {
    return await Models.Examination.find({
      doctorId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();
  }

  async findPendingExaminationsAsync() {
    return await Models.Examination.find({
      status: "scheduled",
    }).lean();
  }
}

export const staffRepository = new StaffRepository();
