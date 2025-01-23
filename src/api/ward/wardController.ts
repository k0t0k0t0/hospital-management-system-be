import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { wardService } from "./wardService";
import { logError } from "@/common/utils/errorLogger";

export class WardController {
  public assignPatientToBed: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { wardId, patientId, assignedBy, expectedDuration } = req.body;
    try {
      const serviceResponse = await wardService.assignPatientToBed(
        wardId,
        patientId,
        assignedBy,
        expectedDuration
      );
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      logError("Failed to assign patient to bed", error, {
        wardId,
        patientId,
        assignedBy,
        expectedDuration,
      });
      return handleServiceResponse(
        ServiceResponse.failure("Failed to assign patient to bed", null, 500),
        res
      );
    }
  };

  public dischargePatient: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const assignmentId = req.params.id;
    const serviceResponse = await wardService.dischargePatient(assignmentId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateWardResources: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const wardId = req.params.wardId;
    const resourceId = req.params.resourceId;
    const serviceResponse = await wardService.updateWardResources(
      wardId,
      resourceId,
      req.body
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getWardStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const wardId = req.params.id;
    const serviceResponse = await wardService.getWardStatus(wardId);
    return handleServiceResponse(serviceResponse, res);
  };

  public getLowStockResources: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await wardService.getLowStockResources();
    return handleServiceResponse(serviceResponse, res);
  };

  public createWard: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await wardService.createWard(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public createBed: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await wardService.createBed(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getAllWards: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await wardService.getAllWards();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const wardController = new WardController();
