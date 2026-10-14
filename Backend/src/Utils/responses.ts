import { Response } from "express";
import * as Sentry from "@sentry/node";
import { logger } from "../Config/logger";

interface SuccessResponseParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface ErrorResponseParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface InternalErrorParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  res: Response;
  error: unknown;
  message?: string;
  data?: T;
}

/**
 * Standard success response: { success: true, message?, ...data }
 */
export const successResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  statusCode = 200,
  message,
  data,
}: SuccessResponseParams<T>) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data && data),
  });
};

/**
 * Convenience helper for HTTP 201 Created
 */
export const createdResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message,
  data,
}: Omit<SuccessResponseParams<T>, "statusCode">) => {
  return successResponse({ res, statusCode: 201, message, data });
};

/**
 * Standard error response: { success: false, message, ...data }
 */
export const errorResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  statusCode = 400,
  message = "Bad request",
  data,
}: ErrorResponseParams<T>) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data && data),
  });
};

/**
 * Convenience helper for HTTP 404 Not Found
 */
export const notFoundResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message = "Resource not found",
  data,
}: Omit<ErrorResponseParams<T>, "statusCode">) => {
  return errorResponse({ res, statusCode: 404, message, data });
};

/**
 * Convenience helper for HTTP 400 Bad Request
 */
export const badRequestResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message = "Bad request",
  data,
}: Omit<ErrorResponseParams<T>, "statusCode">) => {
  return errorResponse({ res, statusCode: 400, message, data });
};

/**
 * Convenience helper for HTTP 401 Unauthorized
 */
export const unauthorizedResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message = "Unauthorized",
  data,
}: Omit<ErrorResponseParams<T>, "statusCode">) => {
  return errorResponse({ res, statusCode: 401, message, data });
};

/**
 * Convenience helper for HTTP 403 Forbidden
 */
export const forbiddenResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message = "Forbidden",
  data,
}: Omit<ErrorResponseParams<T>, "statusCode">) => {
  return errorResponse({ res, statusCode: 403, message, data });
};

/**
 * Convenience helper for HTTP 409 Conflict
 */
export const conflictResponse = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  message = "Conflict",
  data,
}: Omit<ErrorResponseParams<T>, "statusCode">) => {
  return errorResponse({ res, statusCode: 409, message, data });
};

/**
 * Standard 500 Internal Error handler:
 * - Logs to Pino with error stack trace
 * - Captures exception in Sentry
 * - Responds to client with safe, non-leaking message
 */
export const internalError = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  res,
  error,
  message = "Something went wrong.",
  data,
}: InternalErrorParams<T>) => {
  logger.error({ err: error, ...(data && data) }, message);
  Sentry.captureException(error);

  return res.status(500).json({
    success: false,
    message,
    ...(data && data),
  });
};
