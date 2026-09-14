import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { successResponse, errorResponse, internalError } from "../../src/Utils/responses";
import { logger } from "../../src/Config/logger";

// Helper to create a fake Express Response object
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

  it("should support custom status codes in successResponse", () => {
    const res = createMockResponse();

    successResponse({
      res,
      statusCode: 201,
      data: { id: "folder_123" },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      id: "folder_123",
    });
  });

  it("should return a standard error response with default status 400", () => {
    const res = createMockResponse();

    errorResponse({
      res,
      message: "Invalid credentials",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });

  it("should return a 500 status and log error in internalError", () => {
    const res = createMockResponse();
    const loggerSpy = vi.spyOn(logger, "error").mockImplementation(() => logger);

    internalError({
      res,
      error: new Error("DB connection timeout"),
      message: "Database failure",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: "Database failure",
    });
    expect(loggerSpy).toHaveBeenCalled();

    loggerSpy.mockRestore();
  });
});
