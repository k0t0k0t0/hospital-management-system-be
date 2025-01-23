import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { authRegistry } from "@/api/auth/authRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { patientRegistry } from "@/api/patient/patientRouter";
import { staffRegistry } from "@/api/staff/staffRouter";
import { wardRegistry } from "@/api/ward/wardRouter";
import { registerSecuritySchemes } from "./openAPISecuritySchemes";
import { statsRegistry } from "@/api/stats/statsRouter";

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    authRegistry,
    statsRegistry,
    healthCheckRegistry,
    patientRegistry,
    staffRegistry,
    wardRegistry,
  ]);

  registerSecuritySchemes(registry);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Hospital Management System API",
      description: "API documentation for the Hospital Management System",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
    security: [{ bearerAuth: [] }],
  });
}
