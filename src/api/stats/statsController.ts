import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { statsService } from "./statsService";

export class StatsController {
  public getStats: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await statsService.getStats();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const statsController = new StatsController();
