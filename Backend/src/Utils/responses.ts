import { Response } from "express";

export const internalError = ({
  res,
  error,
  message = "Something went wrong.",
}: {
  res: Response;
  error: unknown;
  message?: string;
}) => {
  console.error(error);
  return res
    .status(500)
    .json({ success: false, message: message || "Something went wrong." });
};
