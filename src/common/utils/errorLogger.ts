// Create a new utility for centralized error logging
import { logger } from "@/server";

export const logError = (
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error({
    context,
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};
