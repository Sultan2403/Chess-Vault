import { Queue, QueueEvents } from "bullmq";
import redisClient from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";

export const importQueue = new Queue<ImportJobData>(QUEUE_NAMES.IMPORT, {
  connection: redisClient,
});

export const importQueueEvents = new QueueEvents(QUEUE_NAMES.IMPORT, {
  connection: redisClient,
});
