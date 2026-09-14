import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app";

describe("Express App Routes (Integration with Supertest)", () => {
  describe("Public Routes", () => {
    it("GET / should return 200 and the welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Looking for something? Well it's not here XD",
      });
    });

    it("GET /health should return 503 when database is disconnected", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Service degraded");
      expect(response.body.status).toBe("degraded");
      expect(response.body.services.database).toBe("disconnected");
    });

    it("GET /health should return 200 when database is connected", async () => {
      // Mock mongoose.connection.readyState = 1 (connected)
      const readyStateGetter = vi
        .spyOn(mongoose.connection, "readyState", "get")
        .mockReturnValue(1 as any);

      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Server is healthy");
      expect(response.body.status).toBe("healthy");
      expect(response.body.services.database).toBe("connected");

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
