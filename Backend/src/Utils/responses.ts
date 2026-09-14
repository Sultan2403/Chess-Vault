import { Response } from "express";
import { logger } from "../Config/logger";

interface ResponseParams<T extends Record<string, unknown> = Record<string, unknown>> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface InternalErrorParams<T extends Record<string, unknown> = Record<string, unknown>> {
  res: Response;
  error: unknown;
  message?: string;
  data?: T;
}

export const successResponse = <T extends Record<string, unknown> = Record<string, unknown>>({
  res,
  statusCode = 200,
  message,
  data,
}: ResponseParams<T>) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data && data),
  });
};

export const errorResponse = <T extends Record<string, unknown> = Record<string, unknown>>({
  res,
  statusCode = 400,
  message = "Bad request",
  data,
}: ResponseParams<T>) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data && data),
  });
};

export const internalError = <T extends Record<string, unknown> = Record<string, unknown>>({
  res,
  error,
  message = "Something went wrong.",
  data,
}: InternalErrorParams<T>) => {
  logger.error({ err: error, ...(data && data) }, message);
  return res.status(500).json({
    success: false,
    message,
    ...(data && data),
  });
};

