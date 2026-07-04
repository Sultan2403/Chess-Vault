import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGO_DB_URI: z.string().min(5, "MongoDB URI is required"), // Safer than .url()

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  CLERK_PUBLISHABLE_KEY: z.string().min(5, "Clerk publishable key missing"),
  CLERK_SECRET_KEY: z.string().min(5, "Clerk secret key missing"),

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

export const env = validateEnv()!;
