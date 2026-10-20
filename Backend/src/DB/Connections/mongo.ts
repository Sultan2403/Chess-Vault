import mongoose from "mongoose";
import env from "../../Config/env";
import { logger } from "../../Config/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_DB_URI);
    logger.info("MongoDB connected successfully");
  } catch (err: any) {
    logger.fatal({ err }, "MongoDB connection error. Shutting down server...");
    process.exit(1);
  }
};

export default connectDB;
