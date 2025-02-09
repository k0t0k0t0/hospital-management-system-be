import type { Bed, PatientAssignment, Ward, WardResource } from "./wardModel";
import { Models } from "./wardMongoSchema";
import { logError } from "@/common/utils/errorLogger";

export class WardRepository {
  // Ward methods
  async findAllWardsAsync(): Promise<(Ward & { bedCount: number })[]> {
    try {
      const wards = await Models.Ward.find().lean();

      // Get bed counts for all wards in parallel
      const bedCounts = await Promise.all(
        wards.map((ward) =>
          Models.Bed.countDocuments({ wardId: ward._id.toString() })
        )
      );

      // Combine ward data with bed counts
      return wards.map((ward, index) => ({
        ...this.sanitizeWardData(ward),
        bedCount: bedCounts[index],
      }));
    } catch (error) {
      logError("WardRepository.findAllWardsAsync", error);
      return [];
    }
  }

  async findWardByIdAsync(id: string): Promise<Ward | null> {
    const ward = await Models.Ward.findById(id).lean();
    return ward ? this.sanitizeWardData(ward) : null;
  }

  async createWardAsync(
    wardData: Omit<Ward, "id" | "currentOccupancy" | "createdAt" | "updatedAt">
  ): Promise<Ward> {
    const newWard = new Models.Ward({
      ...wardData,
      currentOccupancy: 0,
    });
    await newWard.save();
    return this.sanitizeWardData(newWard.toObject());
  }

  async updateWardAsync(
    id: string,
    wardData: Partial<Ward>
  ): Promise<Ward | null> {
    const updated = await Models.Ward.findByIdAndUpdate(
      id,
      { $set: wardData },
      { new: true }
    ).lean();
    return updated ? this.sanitizeWardData(updated) : null;
  }

  // Bed methods
  async findBedsByWardAsync(wardId: string): Promise<Bed[]> {
    const beds = await Models.Bed.find({ wardId }).lean();
    return beds.map(this.sanitizeBedData);
  }

  async findAvailableBedsAsync(wardId: string): Promise<Bed[]> {
    const beds = await Models.Bed.find({
      wardId,
      status: "available",
    }).lean();
    return beds.map(this.sanitizeBedData);
  }

  async updateBedStatusAsync(
    bedId: string,
    status: string,
    patientId?: string
  ): Promise<Bed | null> {
    const update: any = {
      status,
      currentPatientId: patientId,
    };

    if (status === "occupied") {
      update.lastOccupiedAt = new Date();
    }

    const updated = await Models.Bed.findByIdAndUpdate(
      bedId,
      { $set: update },
      { new: true }
    ).lean();
    return updated ? this.sanitizeBedData(updated) : null;
  }

  // Patient assignment methods
  async createPatientAssignmentAsync(
    assignmentData: Omit<PatientAssignment, "id" | "assignedAt" | "status">
  ): Promise<PatientAssignment> {
    const newAssignment = new Models.PatientAssignment({
      ...assignmentData,
      status: "active",
      assignedAt: new Date(),
    });
    await newAssignment.save();
    return this.sanitizePatientAssignmentData(newAssignment.toObject());
  }

  async updatePatientAssignmentAsync(
    id: string,
    data: Partial<PatientAssignment>
  ): Promise<PatientAssignment | null> {
    const updated = await Models.PatientAssignment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();
    return updated ? this.sanitizePatientAssignmentData(updated) : null;
  }

  // Resource management methods
  async updateWardResourceAsync(
    wardId: string,
    resourceId: string,
    update: Partial<WardResource>
  ): Promise<WardResource | null> {
    const updated = await Models.WardResource.findOneAndUpdate(
      { wardId, _id: resourceId },
      {
        $set: {
          ...update,
          lastRestockedAt: new Date(),
        },
      },
      { new: true }
    ).lean();
    return updated ? this.sanitizeWardResourceData(updated) : null;
  }

  async getWardResourcesAsync(wardId: string): Promise<WardResource[]> {
    const resources = await Models.WardResource.find({ wardId }).lean();
    return resources.map(this.sanitizeWardResourceData);
  }

  async getLowStockResourcesAsync(): Promise<WardResource[]> {
    const resources = await Models.WardResource.find({
      $expr: { $lte: ["$quantity", "$minimumRequired"] },
    }).lean();
    return resources.map(this.sanitizeWardResourceData);
  }

  async createBedAsync(
    bedData: Omit<Bed, "id" | "lastOccupiedAt">
  ): Promise<Bed> {
    try {
      const newBed = new Models.Bed(bedData);
      await newBed.save();
      return this.sanitizeBedData(newBed.toObject());
    } catch (error) {
      throw error;
    }
  }

  async findBedByIdAsync(id: string): Promise<Bed | null> {
    const bed = await Models.Bed.findById(id).lean();
    return bed ? this.sanitizeBedData(bed) : null;
  }

  // Sanitization helper methods
  private sanitizeWardData(ward: any): Ward {
    return {
      ...ward,
      notes: ward.notes || undefined,
    };
  }

  private sanitizeBedData(bed: any): Bed {
    return {
      ...bed,
      currentPatientId: bed.currentPatientId || undefined,
      lastOccupiedAt: bed.lastOccupiedAt || undefined,
      notes: bed.notes || undefined,
      features: bed.features || undefined,
    };
  }

  private sanitizeWardResourceData(resource: any): WardResource {
    return {
      ...resource,
      notes: resource.notes || undefined,
    };
  }

  private sanitizePatientAssignmentData(assignment: any): PatientAssignment {
    return {
      ...assignment,
      expectedDuration: assignment.expectedDuration || undefined,
      dischargeDate: assignment.dischargeDate || undefined,
      notes: assignment.notes || undefined,
    };
  }
}

export const wardRepository = new WardRepository();
