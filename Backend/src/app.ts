// Main
import express, { Request, Response } from "express";

// Middlewares
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

// Routers
import webhookRoutes from "./Routers/webhooks.routes";
import apiRouter from "./Routers";

// Init
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sultan2403.github.io"],
  }),
);

app.use("/webhooks", webhookRoutes);

app.use(clerkMiddleware());
app.use(express.json());

// Routes

app.use("/api", apiRouter);

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Looking for something? Well it's not here XD" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server says heyyy :)" });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
