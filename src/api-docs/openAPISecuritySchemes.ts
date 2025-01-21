import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function registerSecuritySchemes(registry: OpenAPIRegistry) {
  // Register the Bearer Auth scheme
  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your JWT token in the format: Bearer <token>",
  });
}
