import { Request, Response } from "express";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "../Utils/responses";
// import redis from "../DB/Connections/redis";

export const healthCheckController = async (_req: Request, res: Response) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  // Redis check commented out pending redis initialization
  // let redisStatus = "disconnected";
  // try {
  //   const ping = await redis.ping();
  //   if (ping === "PONG") redisStatus = "connected";
  // } catch {
  //   redisStatus = "error";
  // }

  const isHealthy = mongoStatus === "connected";
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: isHealthy ? "healthy" : "degraded",
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    services: {
      database: mongoStatus,
      // redis: redisStatus,
    },
  };

  if (!isHealthy) {
    return errorResponse({
      res,
      statusCode: 503,
      message: "Service degraded",
      data: healthData,
    });
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Server is healthy",
    data: healthData,
  });
};
