export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const isValidMongoId = (value: unknown): value is string => {
  return typeof value === "string" && MONGO_ID_REGEX.test(value);
};

export const toNumberOrUndefined = (val: unknown) => {
  if (val === undefined || val === null) return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
};

export const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};
