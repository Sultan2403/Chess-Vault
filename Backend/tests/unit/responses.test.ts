import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";

const { mockCaptureException } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
}));

vi.mock("@sentry/node", () => ({
  captureException: mockCaptureException,
}));

import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  internalError,
} from "../../src/Utils";
import { logger } from "../../src/Config/logger";

// Helper to create a mock Express Response object
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: any };
};

describe("Response Helpers", () => {
  describe("successResponse", () => {
    it("should return a standard success response with default status 200", () => {
      const res = createMockResponse();

      successResponse({
        res,
        message: "Operation completed",
        data: { count: 5 },
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Operation completed",
        count: 5,
      });
    });

    it("should support custom status codes and omit message when omitted", () => {
      const res = createMockResponse();

      successResponse({
        res,
        statusCode: 202,
        data: { jobId: "job_456" },
      });

      expect(res.statusCode).toBe(202);
      expect(res.body).toEqual({
        success: true,
        jobId: "job_456",
      });
    });
  });

  describe("createdResponse", () => {
    it("should return status 201 with top-level payload and optional message", () => {
      const res = createMockResponse();

      createdResponse({
        res,
        message: "Folder created",
        data: { folder: { id: "f1", name: "Sicilian" } },
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: "Folder created",
        folder: { id: "f1", name: "Sicilian" },
      });
    });
  });

  describe("errorResponse", () => {
    it("should return a standard error response with default status 400 and default message", () => {
      const res = createMockResponse();

      errorResponse({ res });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Bad request",
      });
    });

    it("should support custom status codes, messages, and payloads", () => {
      const res = createMockResponse();

      errorResponse({
        res,
        statusCode: 503,
        message: "Service degraded",
        data: { service: "redis" },
      });

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual({
        success: false,
        message: "Service degraded",
        service: "redis",
      });
    });
  });

  describe("notFoundResponse", () => {
    it("should return 404 with default 'Resource not found' message", () => {
      const res = createMockResponse();

      notFoundResponse({ res });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "Resource not found",
      });
    });

    it("should allow custom not found messages", () => {
      const res = createMockResponse();

      notFoundResponse({
        res,
        message: "Game not found",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "Game not found",
      });
    });
  });

  describe("badRequestResponse", () => {
    it("should return 400 with default 'Bad request' message", () => {
      const res = createMockResponse();

      badRequestResponse({ res });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Bad request",
      });
    });

    it("should allow custom messages and additional validation error details", () => {
      const res = createMockResponse();

      badRequestResponse({
        res,
        message: "Invalid credentials",
        data: { field: "password" },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid credentials",
        field: "password",
      });
    });
  });

  describe("unauthorizedResponse", () => {
    it("should return 401 with default 'Unauthorized' message", () => {
      const res = createMockResponse();

      unauthorizedResponse({ res });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: "Unauthorized",
      });
    });
  });

  describe("forbiddenResponse", () => {
    it("should return 403 with default 'Forbidden' message", () => {
      const res = createMockResponse();

      forbiddenResponse({ res });

      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: "Forbidden",
      });
    });
  });

  describe("conflictResponse", () => {
    it("should return 409 with default 'Conflict' message", () => {
      const res = createMockResponse();

      conflictResponse({ res });

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: "Conflict",
      });
    });
  });

  describe("internalError", () => {
    it("should return 500, default client message, capture with Sentry, and log via Pino", () => {
      const res = createMockResponse();
      const testError = new Error("Connection failed");
      const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
      mockCaptureException.mockClear();

      internalError({
        res,
        error: testError,
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: "Something went wrong.",
      });
      expect(loggerSpy).toHaveBeenCalledWith({ err: testError }, "Something went wrong.");
      expect(mockCaptureException).toHaveBeenCalledWith(testError);

      loggerSpy.mockRestore();
    });

    it("should allow custom safe messages and forward extra details in logs", () => {
      const res = createMockResponse();
      const testError = new Error("Deadlock detected");
      const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);
      mockCaptureException.mockClear();

      internalError({
        res,
        error: testError,
        message: "Failed to queue game import",
        data: { queue: "import_chess.com" },
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: "Failed to queue game import",
        queue: "import_chess.com",
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        { err: testError, queue: "import_chess.com" },
        "Failed to queue game import",
      );
      expect(mockCaptureException).toHaveBeenCalledWith(testError);

      loggerSpy.mockRestore();
    });
  });
});
