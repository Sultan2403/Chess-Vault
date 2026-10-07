import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import request from "supertest";

// Mock the redis module before app is imported so the health controller
// receives a mock client. By default ping rejects (simulates no connection).
const mockPing = vi.fn().mockRejectedValue(new Error("Redis not available"));
vi.mock("../../src/DB/Connections/redis", () => ({
  default: {
    ping: mockPing,
    on: vi.fn(),
  },
}));

import app from "../../src/app";

describe("Express App Routes (Integration with Supertest)", () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("Public Routes", () => {
    it("GET / should return 200 and the welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Looking for something? Well it's not here XD",
      });
    });

    it("GET /health should return 503 when database is disconnected", async () => {
      // Redis is mocked to reject by default — service is degraded
      mockPing.mockRejectedValueOnce(new Error("Redis not available"));

      const response = await request(app).get("/health");

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Service degraded");
      expect(response.body.status).toBe("degraded");
      expect(response.body.services.database).toBe("disconnected");
    });

    it("GET /health should return 200 when database and redis are connected", async () => {
      // Mock mongoose.connection.readyState = 1 (connected)
      const readyStateGetter = vi
        .spyOn(mongoose.connection, "readyState", "get")
        .mockReturnValue(1 as any);

      // Mock redis ping to return PONG
      mockPing.mockResolvedValueOnce("PONG");

      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Server is healthy");
      expect(response.body.status).toBe("healthy");
      expect(response.body.services.database).toBe("connected");
      expect(response.body.services.redis).toBe("connected");

      readyStateGetter.mockRestore();
    });

    it("GET /unknown-route should return 404 Route not found", async () => {
      const response = await request(app).get("/this-route-does-not-exist");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "Route not found",
      });
    });
  });

  describe("Protected API Routes (Authentication Gate)", () => {
    it("GET /api/games should return 401 Unauthorized when no Clerk auth token is supplied", async () => {
      const response = await request(app).get("/api/games");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    it("GET /api/folders should return 401 Unauthorized when unauthenticated", async () => {
      const response = await request(app).get("/api/folders");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });

    it("GET /api/account/bootstrap should return 401 Unauthorized when unauthenticated", async () => {
      const response = await request(app).get("/api/account/bootstrap");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized" });
    });
  });
});
