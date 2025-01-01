import type {
  AdminStaff,
  Doctor,
  EmergencyCase,
  EmergencyTeamMember,
  LabTechnician,
  LabTest,
  MedicalStaff,
  Nurse,
} from "@/api/staff/staffModel";

export const medicalStaff: MedicalStaff[] = [
  {
    id: 1,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@hospital.com",
    contactNumber: "+1234567890",
    dateOfBirth: "1980-05-15",
    gender: "female",
    address: "456 Medical Ave",
    employeeId: "DOC001",
    department: "Cardiology",
    role: "doctor",
    specialization: "Cardiologist",
    licenseNumber: "MD12345",
    availability: [
      {
        day: "monday",
        startTime: "09:00",
        endTime: "17:00",
      },
      {
        day: "wednesday",
        startTime: "09:00",
        endTime: "17:00",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    firstName: "Mary",
    lastName: "Johnson",
    email: "mary.johnson@hospital.com",
    contactNumber: "+1234567891",
    dateOfBirth: "1985-08-20",
    gender: "female",
    address: "789 Nursing Blvd",
    employeeId: "NUR001",
    department: "Emergency",
    role: "nurse",
    shift: "morning",
    certificationNumber: "RN98765",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    firstName: "Robert",
    lastName: "Brown",
    email: "robert.brown@hospital.com",
    contactNumber: "+1234567892",
    dateOfBirth: "1975-03-10",
    gender: "male",
    address: "321 Admin Street",
    employeeId: "ADM001",
    department: "Administration",
    role: "admin",
    position: "hospital_manager",
    accessLevel: "full",
    responsibilities: [
      "Overall hospital management",
      "Resource allocation",
      "Policy implementation",
    ],
    managedDepartments: ["Emergency", "Surgery", "Cardiology"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const emergencyCases: EmergencyCase[] = [];

export const labTests: LabTest[] = [];

export class StaffRepository {
  async findAllAsync(): Promise<MedicalStaff[]> {
    return medicalStaff;
  }

  async findByIdAsync(id: number): Promise<MedicalStaff | null> {
    return medicalStaff.find((staff) => staff.id === id) || null;
  }

  async findDoctorsAsync(): Promise<Doctor[]> {
    return medicalStaff.filter(
      (staff): staff is Doctor => staff.role === "doctor"
    );
  }

  async findNursesAsync(): Promise<Nurse[]> {
    return medicalStaff.filter(
      (staff): staff is Nurse => staff.role === "nurse"
    );
  }

  async findAdminStaffAsync(): Promise<AdminStaff[]> {
    return medicalStaff.filter(
      (staff): staff is AdminStaff => staff.role === "admin"
    );
  }

  async findStaffByDepartmentAsync(
    department: string
  ): Promise<MedicalStaff[]> {
    return medicalStaff.filter((staff) => {
      if (staff.role === "admin") {
        return staff.managedDepartments?.includes(department);
      }
      return staff.department === department;
    });
  }

  async createAsync(
    staff: Omit<MedicalStaff, "id" | "createdAt" | "updatedAt">
  ): Promise<MedicalStaff> {
    const baseStaff = {
      id: medicalStaff.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newStaff =
      staff.role === "doctor"
        ? ({ ...staff, ...baseStaff } as Doctor)
        : ({ ...staff, ...baseStaff } as Nurse);

    medicalStaff.push(newStaff);
    return newStaff;
  }

  async updateAsync(
    id: number,
    staffData: Partial<MedicalStaff>
  ): Promise<MedicalStaff | null> {
    const index = medicalStaff.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const currentStaff = medicalStaff[index];

    if (currentStaff.role === "doctor") {
      medicalStaff[index] = {
        ...(currentStaff as Doctor),
        ...staffData,
        role: "doctor",
        updatedAt: new Date(),
      } as Doctor;
    } else {
      medicalStaff[index] = {
        ...(currentStaff as Nurse),
        ...staffData,
        role: "nurse",
        updatedAt: new Date(),
      } as Nurse;
    }

    return medicalStaff[index];
  }

  async deleteAsync(id: number): Promise<boolean> {
    const index = medicalStaff.findIndex((s) => s.id === id);
    if (index === -1) return false;

    medicalStaff.splice(index, 1);
    return true;
  }

  async findEmergencyTeamAsync(): Promise<EmergencyTeamMember[]> {
    return medicalStaff.filter(
      (staff): staff is EmergencyTeamMember => staff.role === "emergency"
    );
  }

  async findAvailableEmergencyTeamAsync(): Promise<EmergencyTeamMember[]> {
    return medicalStaff.filter(
      (staff): staff is EmergencyTeamMember =>
        staff.role === "emergency" && staff.activeShift
    );
  }

  async findEmergencyTeamByTriageLevelAsync(
    triageLevel: string
  ): Promise<EmergencyTeamMember[]> {
    return medicalStaff.filter(
      (staff): staff is EmergencyTeamMember =>
        staff.role === "emergency" &&
        staff.triageAccess.includes(triageLevel as any)
    );
  }

  async createEmergencyCaseAsync(
    caseData: Omit<EmergencyCase, "id" | "createdAt" | "updatedAt">
  ): Promise<EmergencyCase> {
    const newCase: EmergencyCase = {
      ...caseData,
      id: emergencyCases.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    emergencyCases.push(newCase);
    return newCase;
  }

  async updateEmergencyCaseAsync(
    id: number,
    caseData: Partial<EmergencyCase>
  ): Promise<EmergencyCase | null> {
    const index = emergencyCases.findIndex((c) => c.id === id);
    if (index === -1) return null;

    emergencyCases[index] = {
      ...emergencyCases[index],
      ...caseData,
      updatedAt: new Date(),
    };
    return emergencyCases[index];
  }

  async findEmergencyCaseByIdAsync(id: number): Promise<EmergencyCase | null> {
    return emergencyCases.find((c) => c.id === id) || null;
  }

  async findActiveEmergencyCasesAsync(): Promise<EmergencyCase[]> {
    return emergencyCases.filter(
      (c) => c.status !== "resolved" && c.status !== "transferred"
    );
  }

  async findLabTechniciansAsync(): Promise<LabTechnician[]> {
    return medicalStaff.filter(
      (staff): staff is LabTechnician => staff.role === "lab_technician"
    );
  }

  async findAvailableLabTechniciansAsync(
    testType: string
  ): Promise<LabTechnician[]> {
    return medicalStaff.filter(
      (staff): staff is LabTechnician =>
        staff.role === "lab_technician" &&
        staff.activeShift &&
        staff.specialization.includes(testType as any)
    );
  }

  async createLabTestAsync(
    testData: Omit<LabTest, "id" | "createdAt" | "updatedAt">
  ): Promise<LabTest> {
    const newTest: LabTest = {
      ...testData,
      id: labTests.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    labTests.push(newTest);
    return newTest;
  }

  async updateLabTestAsync(
    id: number,
    testData: Partial<LabTest>
  ): Promise<LabTest | null> {
    const index = labTests.findIndex((t) => t.id === id);
    if (index === -1) return null;

    labTests[index] = {
      ...labTests[index],
      ...testData,
      updatedAt: new Date(),
    };
    return labTests[index];
  }

  async findLabTestByIdAsync(id: number): Promise<LabTest | null> {
    return labTests.find((t) => t.id === id) || null;
  }

  async findLabTestsByPatientAsync(patientId: number): Promise<LabTest[]> {
    return labTests.filter((t) => t.patientId === patientId);
  }

  async findPendingLabTestsAsync(): Promise<LabTest[]> {
    return labTests.filter(
      (t) => t.status === "scheduled" || t.status === "in_progress"
    );
  }

  async findDoctors({
    department,
    specialization,
  }: {
    department?: string;
    specialization?: string;
  }): Promise<Doctor[]> {
    let doctors = await this.findDoctorsAsync();

    if (department) {
      doctors = doctors.filter(doctor => doctor.department === department);
    }

    if (specialization) {
      doctors = doctors.filter(doctor => doctor.specialization === specialization);
    }

    return doctors;
  }
}

export const staffRepository = new StaffRepository();
