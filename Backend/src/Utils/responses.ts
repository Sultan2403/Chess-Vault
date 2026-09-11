import { Response } from "express";
import { logger } from "../Config/logger";

interface ResponseParams {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: Record<string, any>;
}

export const successResponse = ({
  res,
  statusCode = 200,
  message,
  data = {},
}: ResponseParams) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...data,
  });
};

export const errorResponse = ({
  res,
  statusCode = 400,
  message = "Bad request",
  data = {},
}: ResponseParams) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...data,
  });
};

export const internalError = ({
  res,
  error,
  message = "Something went wrong.",
  data = {},
}: {
  res: Response;
  error: unknown;
  message?: string;
  data?: Record<string, any>;
}) => {
  logger.error({ err: error, ...data }, message);
  return res.status(500).json({
    success: false,
    message,
    ...data,
  });
};
