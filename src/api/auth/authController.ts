import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { Request, Response } from "express";
import { authService } from "./authService";

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password, role } = req.body;
    const serviceResponse = await authService.login(email, password, role);
    return handleServiceResponse(serviceResponse, res);
  }

  async requestPasswordReset(req: Request, res: Response) {
    const { email, role } = req.body;
    const serviceResponse = await authService.requestPasswordReset(email, role);
    return handleServiceResponse(serviceResponse, res);
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    const serviceResponse = await authService.resetPassword(token, newPassword);
    return handleServiceResponse(serviceResponse, res);
  }
}

export const authController = new AuthController();
