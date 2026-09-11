// Main
import express, { Request, Response } from "express";

// Middlewares
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { requestLogger } from "./Middlewares/request_logger";

// Routers & Controllers
import webhookRoutes from "./Routers/webhooks.routes";
import apiRouter from "./Routers";
import { healthCheckController } from "./Controllers/health.controller";
import { errorResponse } from "./Utils/responses";
import env from "./Config/env";

// Init
const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
  }),
);

app.use(clerkMiddleware());
app.use(requestLogger);

app.use("/webhooks", webhookRoutes);


app.use(express.json());

// Routes
app.use("/api", apiRouter);

app.get("/", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Looking for something? Well it's not here XD" });
});

app.get("/health", healthCheckController);

app.use((_req: Request, res: Response) => {
  return errorResponse({
    res,
    statusCode: 404,
    message: "Route not found",
  });
});

export default app;
