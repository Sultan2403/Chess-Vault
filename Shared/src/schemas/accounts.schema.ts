import { z } from "zod";
import { Platforms } from "../constants/platforms.js";
import { isValidMongoId } from "../utils/index.js";

const platformValues = Object.values(Platforms);

export const linkedAccountInput = z.object({
  platform: z.enum(platformValues),
  username: z.string().trim().min(1, "Username is required"),
});

export const connectLinkedAccountsBody = z
  .object({
    accounts: z.array(linkedAccountInput).min(1).max(platformValues.length),
  })
  .refine(
    ({ accounts }) => new Set(accounts.map((account) => account.platform)).size === accounts.length,
    { message: "Only one username per platform can be connected at a time" },
  );

export const linkedAccountParams = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Linked account ID is required")
    .refine(isValidMongoId, { message: "Invalid linked account ID" }),
});
