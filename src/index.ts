import { env } from "@/common/utils/envConfig";
import { connectToDatabase } from "@/config/database";
import { app, logger } from "@/server";
import mongoose from "mongoose";

// Connect to MongoDB before starting the server
connectToDatabase().then(() => {
  const server = app.listen(env.PORT, () => {
    const { NODE_ENV, HOST, PORT } = env;
    logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
  });

  const onCloseSignal = () => {
    logger.info("sigint received, shutting down");
    // Close MongoDB connection before shutting down
    mongoose.connection.close().then(() => {
      server.close(() => {
        logger.info("server closed");
        process.exit();
      });
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
  };

  process.on("SIGINT", onCloseSignal);
  process.on("SIGTERM", onCloseSignal);
});
