import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { z } from "@/common/utils/zodExtensions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter = express.Router();

// Register login schema
const LoginResponseSchema = z.object({
  token: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .omit({ password: true }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["doctor", "nurse", "admin", "emergency", "lab_technician"]),
  }),
});

// Register the login path in OpenAPI
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Successfully logged in"),
});

// Reset password schemas
const requestResetSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(["doctor", "nurse", "admin", "emergency", "lab_technician"]),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(6),
  }),
});

// Register OpenAPI paths
authRegistry.registerPath({
  method: "post",
  path: "/auth/request-reset",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: requestResetSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(z.object({ message: z.string() }), "Reset email sent"),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Authentication"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(z.object({ message: z.string() }), "Password reset successful"),
});

// Routes
authRouter.post("/request-reset", validateRequest(requestResetSchema), authController.requestPasswordReset);

authRouter.post("/reset-password", validateRequest(resetPasswordSchema), authController.resetPassword);

// Login route
authRouter.post("/login", validateRequest(loginSchema), authController.login);
