import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:5173") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  MONGODB_URI: str({
    devDefault: testOnly(
      "mongodb+srv://k0t0jall0habd:Yu09kwKFydZIu4d4@hospital.0owtx.mongodb.net/?retryWrites=true&w=majority&appName=Hospital",
    ),
  }),
  JWT_SECRET: str({
    devDefault: testOnly("your-secret-key"),
  }),
});
