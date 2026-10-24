import mongoose, { Schema } from "mongoose";
import {
  PlatformValues,
  IMPORT_TRIGGERS,
  IMPORT_STATUSES,
} from "../../Config/constants";

const countersSchema = new Schema(
  {
    fetched: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    inserted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    duplicates: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    skipped: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const errorSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const importSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    linkedAccountId: {
      type: Schema.Types.ObjectId,
      ref: "linked_accounts",
      required: true,
    },

    platform: {
      type: String,
      required: true,
      enum: PlatformValues,
    },

    trigger: {
      type: String,
      required: true,
      enum: IMPORT_TRIGGERS,
    },

    status: {
      type: String,
      required: true,
      enum: IMPORT_STATUSES,
      default: "queued",
      index: true,
    },

    counters: {
      type: countersSchema,
      required: true,
      default: () => ({}),
    },

    error: {
      type: errorSchema,
      required: false,
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    finishedAt: {
      type: Date,
      required: false,
    },

    jobRef: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

// Indexes
// Fast history query for a user: newest runs first
importSchema.index({ userId: 1, createdAt: -1 });

// Database-level guard: at most ONE active (queued or running) import per linked account
importSchema.index(
  { linkedAccountId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["queued", "running"] } },
  },
);

importSchema.set("toJSON", {
  transform: (_, obj) => {
    const { _id, __v, linkedAccountId, ...rest } = obj;

    return {
      id: _id.toString(),
      linkedAccountId: linkedAccountId ? linkedAccountId.toString() : undefined,
      ...rest,
    };
  },
});

const Imports = mongoose.model("imports", importSchema, "imports");

export default Imports;
