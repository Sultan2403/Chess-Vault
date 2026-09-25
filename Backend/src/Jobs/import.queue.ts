import { Queue } from "bullmq";
import redisClient from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";

export const importQueue = new Queue<ImportJobData>(QUEUE_NAMES.IMPORT, {
  connection: redisClient,
});
