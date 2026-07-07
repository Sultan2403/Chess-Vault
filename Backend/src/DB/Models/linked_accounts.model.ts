import mongoose from "mongoose";

const linkedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      required: true,
      enum: ["chess.com", "lichess"],
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedUsername: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

linkedAccountSchema.index(
  {
    userId: 1,
    platform: 1,
    normalizedUsername: 1,
  },
  {
    unique: true,
  },
);

linkedAccountSchema.set("toJSON", {
  transform: (_, obj) => {
    const { _id, __v, normalizedUsername, ...rest } = obj;

    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

const LinkedAccount = mongoose.model(
  "linked_accounts",
  linkedAccountSchema,
  "linked_accounts",
);

export default LinkedAccount;