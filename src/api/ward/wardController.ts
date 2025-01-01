import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, RequestHandler, Response } from "express";
import { wardService } from "./wardService";

export class WardController {
  public assignPatientToBed: RequestHandler = async (req: Request, res: Response) => {
    const { wardId, patientId, assignedBy, expectedDuration } = req.body;
    const serviceResponse = await wardService.assignPatientToBed(wardId, patientId, assignedBy, expectedDuration);
    return handleServiceResponse(serviceResponse, res);
  };

  public dischargePatient: RequestHandler = async (req: Request, res: Response) => {
    const assignmentId = Number.parseInt(req.params.id, 10);
    const serviceResponse = await wardService.dischargePatient(assignmentId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateWardResources: RequestHandler = async (req: Request, res: Response) => {
    const wardId = Number.parseInt(req.params.wardId, 10);
    const resourceId = Number.parseInt(req.params.resourceId, 10);
    const serviceResponse = await wardService.updateWardResources(wardId, resourceId, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getWardStatus: RequestHandler = async (req: Request, res: Response) => {
    const wardId = Number.parseInt(req.params.id, 10);
    const serviceResponse = await wardService.getWardStatus(wardId);
    return handleServiceResponse(serviceResponse, res);
  };

  public getLowStockResources: RequestHandler = async (_req: Request, res: Response) => {
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
}

export const wardController = new WardController();
