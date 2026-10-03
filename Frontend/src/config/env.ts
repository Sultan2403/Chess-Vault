import { z } from "zod";

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "VITE_CLERK_PUBLISHABLE_KEY is required"),
  VITE_API_URL: z
    .url("VITE_API_URL must be a valid URL")
    .default("http://localhost:5000/api"),
  MODE: z.string().default("development"),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
});

const validateEnv = () => {
  const result = envSchema.safeParse({
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });

  if (!result.success) {
    console.error("❌ Invalid Frontend Environment Variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  }

  return result;
};

export const envResult = validateEnv();

export type Env = z.infer<typeof envSchema>;

const env = (
  envResult.success
    ? envResult.data
    : {
        VITE_CLERK_PUBLISHABLE_KEY:
          import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
        VITE_API_URL:
          import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
        MODE: import.meta.env.MODE ?? "development",
        DEV: import.meta.env.DEV ?? true,
        PROD: import.meta.env.PROD ?? false,
      }
) as Env;

export default env;

