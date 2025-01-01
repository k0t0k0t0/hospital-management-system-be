import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { extendZod } from "@zodyac/zod-mongoose";
import { z } from "zod";

// Extend zod with OpenAPI and mongoose functionality
extendZodWithOpenApi(z);
extendZod(z);

// Export the extended z
export { z };
