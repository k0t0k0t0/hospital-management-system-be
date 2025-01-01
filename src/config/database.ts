import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import mongoose from "mongoose";

export async function connectToDatabase() {
  logger.info("Connecting to MongoDB...");
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    logger.info("Successfully connected to MongoDB.");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Lost MongoDB connection...");
});

mongoose.connection.on("reconnected", () => {
  logger.info("Reconnected to MongoDB");
});
