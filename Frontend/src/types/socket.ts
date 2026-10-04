import type { ImportProgressPayload, ImportCompletePayload } from "@chess-vault/shared";

export type ImportProgressType = Omit<ImportProgressPayload, "userId">
export type ImportCompleteType = Omit<ImportCompletePayload, "userId">