import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// Load .env from Backend folder regardless of where the command was executed
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback to current working directory

export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGO_DB_URI: isTest
    ? z.string().default("mongodb://localhost:27017/chess-vault-test")
    : z.string().min(5, "MongoDB URI is required"),

  REDIS_PORT: z.coerce.number().min(1, "REDIS_PORT is required").default(6379),
  REDIS_URL: isProd
    ? z.url("REDIS_URL must be a valid connection string")
    : z.string().min(1, "REDIS_URL is required").default("localhost"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal", "silent"])
    .default(isTest ? "silent" : "info"),

  CLERK_PUBLISHABLE_KEY: isTest
    ? z.string().default("pk_test_dummy_key")
    : z.string().min(5, "Clerk publishable key missing"),
  CLERK_SECRET_KEY: isTest
    ? z.string().default("sk_test_dummy_key")
    : z.string().min(5, "Clerk secret key missing"),
  CLERK_WEBHOOK_SECRET: isTest
    ? z.string().default("whsec_test_dummy_secret")
    : z.string().min(5, "Clerk webhook secret not configured."),

  PAYSTACK_API_KEY: isTest
    ? z.string().default("sk_test_paystack")
    : z.string().min(5, "Paystack API key missing"),
  PAYSTACK_TEST_API_KEY: isTest
    ? z.string().default("sk_test_paystack_test")
    : z.string().min(5, "Paystack test API key missing"),

  DEV_EMAIL: isTest
    ? z.string().default("test@example.com")
    : z.string().min(5, "Dev email not configured"),

  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,https://sultan2403.github.io")
    .transform((val) =>
      val
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid Environment Variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  return result.data;
};

const env = validateEnv()!;

export default env;
