import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import type { Bed, PatientAssignment, Ward, WardResource } from "./wardModel";
import { wardRepository } from "./wardRepository";

export class WardService {
  async assignPatientToBed(wardId: number, patientId: number, assignedBy: number, expectedDuration?: number) {
    try {
      // Find available bed
      const availableBeds = await wardRepository.findAvailableBedsAsync(wardId);
      if (availableBeds.length === 0) {
        return ServiceResponse.failure("No available beds in the ward", null, StatusCodes.BAD_REQUEST);
      }

      const bed = availableBeds[0];

      // Create patient assignment
      const assignment = await wardRepository.createPatientAssignmentAsync({
        patientId,
        wardId,
        bedId: bed.id,
        assignedBy,
        expectedDuration,
        notes: "",
      });

      // Update bed status
      await wardRepository.updateBedStatusAsync(bed.id, "occupied", patientId);

      // Update ward occupancy
      const ward = await wardRepository.findWardByIdAsync(wardId);
      if (ward) {
        await wardRepository.updateWardAsync(wardId, {
          currentOccupancy: ward.currentOccupancy + 1,
        });
      }

      return ServiceResponse.success("Patient assigned successfully", assignment);
    } catch (error) {
      return ServiceResponse.failure("Failed to assign patient", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async dischargePatient(assignmentId: number) {
    try {
      const assignment = await wardRepository.updatePatientAssignmentAsync(assignmentId, {
        status: "discharged",
        dischargeDate: new Date(),
      });

      if (!assignment) {
        return ServiceResponse.failure("Assignment not found", null, StatusCodes.NOT_FOUND);
      }

      // Update bed status
      await wardRepository.updateBedStatusAsync(assignment.bedId, "cleaning");

      // Update ward occupancy
      const ward = await wardRepository.findWardByIdAsync(assignment.wardId);
      if (ward) {
        await wardRepository.updateWardAsync(assignment.wardId, {
          currentOccupancy: ward.currentOccupancy - 1,
        });
      }

      return ServiceResponse.success("Patient discharged successfully", assignment);
    } catch (error) {
      return ServiceResponse.failure("Failed to discharge patient", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateWardResources(wardId: number, resourceId: number, update: Partial<WardResource>) {
    try {
      const resource = await wardRepository.updateWardResourceAsync(wardId, resourceId, update);

      if (!resource) {
        return ServiceResponse.failure("Resource not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Resource updated successfully", resource);
    } catch (error) {
      return ServiceResponse.failure("Failed to update resource", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getWardStatus(wardId: number) {
    try {
      const ward = await wardRepository.findWardByIdAsync(wardId);
      if (!ward) {
        return ServiceResponse.failure("Ward not found", null, StatusCodes.NOT_FOUND);
      }

      const beds = await wardRepository.findBedsByWardAsync(wardId);
      const resources = await wardRepository.getWardResourcesAsync(wardId);

      return ServiceResponse.success("Ward status retrieved", {
        ward,
        beds,
        resources,
        occupancyRate: (ward.currentOccupancy / ward.capacity) * 100,
      });
    } catch (error) {
      return ServiceResponse.failure("Failed to get ward status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getLowStockResources() {
    try {
      const resources = await wardRepository.getLowStockResourcesAsync();
      return ServiceResponse.success("Low stock resources retrieved", resources);
    } catch (error) {
      return ServiceResponse.failure("Failed to get low stock resources", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createWard(wardData: Omit<Ward, "id" | "currentOccupancy" | "createdAt" | "updatedAt">) {
    try {
      const ward = await wardRepository.createWardAsync(wardData);
      return ServiceResponse.success("Ward created successfully", ward, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to create ward", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async createBed(bedData: Omit<Bed, "id" | "lastOccupiedAt">) {
    try {
      // Verify ward exists
      const ward = await wardRepository.findWardByIdAsync(bedData.wardId);
      if (!ward) {
        return ServiceResponse.failure("Ward not found", null, StatusCodes.NOT_FOUND);
      }

      const bed = await wardRepository.createBedAsync(bedData);
      return ServiceResponse.success("Bed created successfully", bed, StatusCodes.CREATED);
    } catch (error) {
      return ServiceResponse.failure("Failed to create bed", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const wardService = new WardService();
