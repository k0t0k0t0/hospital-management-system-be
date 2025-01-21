import "@/common/utils/zodExtensions";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { connectToDatabase } from "@/config/database";
import { authRouter } from "./api/auth/authRouter";
import { patientRouter } from "./api/patient/patientRouter";
import { staffRouter } from "./api/staff/staffRouter";
import { wardRouter } from "./api/ward/wardRouter";
const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// TODO: Remove this after testing
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/staff", staffRouter);
app.use("/patients", patientRouter);
app.use("/ward", wardRouter);
app.use("/auth", authRouter);
// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

// Remove the top-level await
const initializeDatabase = async () => {
  await connectToDatabase();
};

export { app, logger, initializeDatabase };
