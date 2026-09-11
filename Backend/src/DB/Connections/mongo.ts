import mongoose from "mongoose";
import env from "../../Config/env";
import { logger } from "../../Config/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_DB_URI);
    logger.info("MongoDB connected successfully");
  } catch (err: any) {
    logger.error({ err }, "MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;
