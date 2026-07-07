import mongoose from "mongoose";
import { Platforms, Results } from "../../Config/constants";

const playerSchema = {
  username: {
    type: String,
    required: true,
    trim: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 0,
  },
};

const gameSchema = new mongoose.Schema(
  {
    // Ownership
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      required: true,
    },

    // Source
    platform: {
      type: String,
      enum: Platforms,
      required: true,
    },

    platformGameId: {
      type: String,
      required: true,
      trim: true,
    },

    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // User metadata
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Chess metadata
    whitePlayer: {
      type: playerSchema,
      required: true,
    },

    blackPlayer: {
      type: playerSchema,
      required: true,
    },

    result: {
      type: String,
      enum: Results,
      required: true,
    },

    timeControl: {
      type: String,
      required: true,
      trim: true,
    },

    timeClass: {
      type: String,
      required: true,
      trim: true,
    },

    playedAt: {
      type: Date,
      required: true,
    },

    // Canonical game representation
    pgn: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },

    tags: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20,
    },
  },
  {
    strict: true,
    timestamps: true,
  },
);

// Prevent duplicate imports
gameSchema.index(
  {
    userId: 1,
    platform: 1,
    platformGameId: 1,
  },
  {
    unique: true,
  },
);

// Fast folder lookups
gameSchema.index({
  userId: 1,
  folderId: 1,
});

gameSchema.set("toJSON", {
  transform: (_, obj) => {
    const { _id, __v, ...rest } = obj;

    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

const Game = mongoose.model("games", gameSchema, "games");

export default Game;
