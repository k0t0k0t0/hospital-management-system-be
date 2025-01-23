import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { z } from "@/common/utils/zodExtensions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { statsController } from "./statsController";

export const statsRegistry = new OpenAPIRegistry();
export const statsRouter = express.Router();

// Define the stats schema
const StatsSchema = z.object({
  totalPatients: z.number(),
  totalDoctors: z.number(),
  totalNurses: z.number(),
  totalEmergencyTeam: z.number(),
  totalLabTechnicians: z.number(),
  totalWards: z.number(),
  upcomingAppointments: z.number(),
});

// Register the path in OpenAPI
statsRegistry.registerPath({
  method: "get",
  path: "/stats",
  tags: ["Statistics"],
  responses: createApiResponse(
    StatsSchema,
    "Successfully retrieved system statistics"
  ),
});

// Add the route
statsRouter.get("/", statsController.getStats);
