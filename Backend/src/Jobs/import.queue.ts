import { Queue, QueueEvents } from "bullmq";
import { BullMQRedis } from "../DB/Connections/redis";
import type { ImportJobData } from "../Types/jobs.types";
import { QUEUE_NAMES } from "../Config/constants";

export const importQueue = new Queue<ImportJobData>(QUEUE_NAMES.IMPORT, {
  connection: { BullMQRedis },
});

export const importQueueEvents = new QueueEvents(QUEUE_NAMES.IMPORT, {
  connection: { BullMQRedis },
});
