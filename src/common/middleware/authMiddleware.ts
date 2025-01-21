import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ServiceResponse.failure("Access denied. No token provided.", null, StatusCodes.UNAUTHORIZED));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded as { id: string; email: string; role: string };
    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(ServiceResponse.failure("Invalid token.", null, StatusCodes.UNAUTHORIZED));
  }
};

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(ServiceResponse.failure("Access denied. User not authenticated.", null, StatusCodes.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(ServiceResponse.failure("Access denied. Insufficient permissions.", null, StatusCodes.FORBIDDEN));
    }

    next();
  };
};
