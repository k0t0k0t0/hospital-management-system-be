import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { z } from "@/common/utils/zodExtensions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { wardController } from "./wardController";
import {
  BedSchema,
  CreatePatientAssignmentSchema,
  PatientAssignmentSchema,
  UpdateWardResourceSchema,
  WardResourceSchema,
  WardSchema,
} from "./wardModel";

export const wardRegistry = new OpenAPIRegistry();
export const wardRouter = Router();

// Register schemas
wardRegistry.register("Ward", WardSchema);
wardRegistry.register("Bed", BedSchema);
wardRegistry.register("WardResource", WardResourceSchema);
wardRegistry.register("PatientAssignment", PatientAssignmentSchema);

// Register ward management paths
wardRegistry.registerPath({
  method: "post",
  path: "/ward/assign-patient",
  tags: ["Ward Management"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePatientAssignmentSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    PatientAssignmentSchema,
    "Successfully assigned patient to bed"
  ),
});

wardRegistry.registerPath({
  method: "post",
  path: "/ward/discharge/{id}",
  tags: ["Ward Management"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(
    PatientAssignmentSchema,
    "Successfully discharged patient"
  ),
});

wardRegistry.registerPath({
  method: "put",
  path: "/ward/{wardId}/resources/{resourceId}",
  tags: ["Ward Management"],
  request: {
    params: z.object({
      wardId: z.string(),
      resourceId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateWardResourceSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    WardResourceSchema,
    "Successfully updated ward resources"
  ),
});

wardRegistry.registerPath({
  method: "get",
  path: "/ward/{id}/status",
  tags: ["Ward Management"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(
    z.object({
      ward: WardSchema,
      beds: z.array(BedSchema),
      resources: z.array(WardResourceSchema),
      occupancyRate: z.number(),
    }),
    "Successfully retrieved ward status"
  ),
});

wardRegistry.registerPath({
  method: "get",
  path: "/ward/resources/low-stock",
  tags: ["Ward Management"],
  responses: createApiResponse(
    z.array(WardResourceSchema),
    "Successfully retrieved low stock resources"
  ),
});

wardRegistry.registerPath({
  method: "post",
  path: "/ward",
  tags: ["Ward Management"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: WardSchema.omit({
            id: true,
            currentOccupancy: true,
            createdAt: true,
            updatedAt: true,
          }),
        },
      },
    },
  },
  responses: createApiResponse(WardSchema, "Successfully created ward"),
});

wardRegistry.registerPath({
  method: "post",
  path: "/ward/bed",
  tags: ["Ward Management"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: BedSchema.omit({
            id: true,
            lastOccupiedAt: true,
          }),
        },
      },
    },
  },
  responses: createApiResponse(BedSchema, "Successfully created bed"),
});

// Register ward management routes
wardRouter.post(
  "/assign-patient",
  validateRequest(
    z.object({
      body: CreatePatientAssignmentSchema,
    })
  ),
  wardController.assignPatientToBed
);

wardRouter.post(
  "/discharge/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
    })
  ),
  wardController.dischargePatient
);

wardRouter.put(
  "/:wardId/resources/:resourceId",
  validateRequest(
    z.object({
      params: z.object({
        wardId: z.string(),
        resourceId: z.string(),
      }),
      body: UpdateWardResourceSchema,
    })
  ),
  wardController.updateWardResources
);

wardRouter.get(
  "/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
    })
  ),
  wardController.getWardStatus
);

wardRouter.get("/resources/low-stock", wardController.getLowStockResources);

wardRouter.post(
  "/",
  validateRequest(
    z.object({
      body: WardSchema.omit({
        id: true,
        currentOccupancy: true,
        createdAt: true,
        updatedAt: true,
      }),
    })
  ),
  wardController.createWard
);

wardRouter.post(
  "/bed",
  validateRequest(
    z.object({
      body: BedSchema.omit({
        id: true,
        lastOccupiedAt: true,
      }),
    })
  ),
  wardController.createBed
);
