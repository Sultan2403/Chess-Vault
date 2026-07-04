import mongoose from "mongoose";

const foldersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      required: false,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { strict: true, timestamps: true },
);

foldersSchema.set("toJSON", {
  transform: (doc, obj) => {
    const { _id, __v, ...rest } = obj;
    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

const Folders = mongoose.model("folders", foldersSchema, "folders");
