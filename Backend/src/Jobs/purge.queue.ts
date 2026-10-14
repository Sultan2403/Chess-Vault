import { Queue } from "bullmq";
import redisClient from "../DB/Connections/redis";
import type { PurgeUserJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";

export const purgeUserQueue = new Queue<PurgeUserJobData>(
  QUEUE_NAMES.PURGE_USER,
  {
    connection: redisClient,
  },
);
