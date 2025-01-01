import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import zodSchema, { extendZod } from "@zodyac/zod-mongoose";
import { z } from "zod";

// Extend zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Extend zod with mongoose functionality
extendZod(z);

// Export the extended zod instance
export { z, zodSchema };
