// Main
import express, { Request, Response } from "express";

// Middlewares
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import requireAuth from "./Middlewares/Auth/users.auth";

// Routers
import gamesRouter from "./Routers/games.routes";
import foldersRouter from "./Routers/folders.routes";

// Init
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sultan2403.github.io"],
  }),
);

app.use(clerkMiddleware());

app.use(express.json());

// Routes

app.use("/games", requireAuth, gamesRouter);
app.use("/folders", requireAuth, foldersRouter);

app.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "Looking for something? Well it's not here XD" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server says heyyy :)" });
});

export default app;
