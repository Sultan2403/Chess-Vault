import { z } from "zod";
import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";
const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGO_DB_URI: z.string().min(5, "MongoDB URI is required"),

  REDIS_PORT: z.coerce.number().min(1, "REDIS_PORT is required").default(6379),
  REDIS_URL: isProd
    ? z.url("REDIS_URL must be a valid connection string")
    : z.string().min(1, "REDIS_URL is required").default("localhost"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  CLERK_PUBLISHABLE_KEY: z.string().min(5, "Clerk publishable key missing"),
  CLERK_SECRET_KEY: z.string().min(5, "Clerk secret key missing"),
  CLERK_WEBHOOK_SECRET: z
    .string()
    .min(5, "Clerk webhook secret not configured."),

  PAYSTACK_API_KEY: z.string().min(5, "Paystack API key missing"),
  PAYSTACK_TEST_API_KEY: z.string().min(5, "Paystack test API key missing"),

  DEV_EMAIL: z.string().min(5, "Dev email not configured"),
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
