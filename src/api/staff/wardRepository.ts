import type {
  Bed,
  BedStatusEnum,
  PatientAssignment,
  Ward,
  WardResource,
} from "./wardModel";

export const wards: Ward[] = [];
export const beds: Bed[] = [];
export const wardResources: WardResource[] = [];
export const patientAssignments: PatientAssignment[] = [];

export class WardRepository {
  // Ward methods
  async findAllWardsAsync(): Promise<Ward[]> {
    return wards;
  }

  async findWardByIdAsync(id: number): Promise<Ward | null> {
    return wards.find((ward) => ward.id === id) || null;
  }

  async createWardAsync(
    wardData: Omit<Ward, "id" | "currentOccupancy" | "createdAt" | "updatedAt">
  ): Promise<Ward> {
    const newWard: Ward = {
      ...wardData,
      id: wards.length + 1,
      currentOccupancy: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    wards.push(newWard);
    return newWard;
  }

  async updateWardAsync(
    id: number,
    wardData: Partial<Ward>
  ): Promise<Ward | null> {
    const index = wards.findIndex((w) => w.id === id);
    if (index === -1) return null;

    wards[index] = {
      ...wards[index],
      ...wardData,
      updatedAt: new Date(),
    };
    return wards[index];
  }

  // Bed methods
  async findBedsByWardAsync(wardId: number): Promise<Bed[]> {
    return beds.filter((bed) => bed.wardId === wardId);
  }

  async findAvailableBedsAsync(wardId: number): Promise<Bed[]> {
    return beds.filter(
      (bed) => bed.wardId === wardId && bed.status === "available"
    );
  }

  async updateBedStatusAsync(
    bedId: number,
    status: (typeof BedStatusEnum)["_type"],
    patientId?: number
  ): Promise<Bed | null> {
    const index = beds.findIndex((b) => b.id === bedId);
    if (index === -1) return null;

    beds[index] = {
      ...beds[index],
      status,
      currentPatientId: patientId,
      lastOccupiedAt:
        status === "occupied" ? new Date() : beds[index].lastOccupiedAt,
    };
    return beds[index];
  }

  // Patient assignment methods
  async createPatientAssignmentAsync(
    assignmentData: Omit<PatientAssignment, "id" | "assignedAt" | "status">
  ): Promise<PatientAssignment> {
    const newAssignment: PatientAssignment = {
      ...assignmentData,
      id: patientAssignments.length + 1,
      assignedAt: new Date(),
      status: "active",
    };
    patientAssignments.push(newAssignment);
    return newAssignment;
  }

  async updatePatientAssignmentAsync(
    id: number,
    data: Partial<PatientAssignment>
  ): Promise<PatientAssignment | null> {
    const index = patientAssignments.findIndex((pa) => pa.id === id);
    if (index === -1) return null;

    patientAssignments[index] = {
      ...patientAssignments[index],
      ...data,
    };
    return patientAssignments[index];
  }

  // Resource management methods
  async updateWardResourceAsync(
    wardId: number,
    resourceId: number,
    update: Partial<WardResource>
  ): Promise<WardResource | null> {
    const index = wardResources.findIndex(
      (r) => r.id === resourceId && r.wardId === wardId
    );
    if (index === -1) return null;

    wardResources[index] = {
      ...wardResources[index],
      ...update,
      lastRestockedAt: new Date(),
    };
    return wardResources[index];
  }

  async getWardResourcesAsync(wardId: number): Promise<WardResource[]> {
    return wardResources.filter((resource) => resource.wardId === wardId);
  }

  async getLowStockResourcesAsync(): Promise<WardResource[]> {
    return wardResources.filter(
      (resource) => resource.quantity <= resource.minimumRequired
    );
  }

  async createBedAsync(bedData: Omit<Bed, "id" | "lastOccupiedAt">): Promise<Bed> {
    const newBed: Bed = {
      ...bedData,
      id: beds.length + 1,
      lastOccupiedAt: undefined,
    };
    beds.push(newBed);
    return newBed;
  }

  async findBedByIdAsync(id: number): Promise<Bed | null> {
    return beds.find((bed) => bed.id === id) || null;
  }
}

export const wardRepository = new WardRepository();
