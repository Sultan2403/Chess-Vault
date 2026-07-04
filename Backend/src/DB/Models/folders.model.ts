import mongoose from "mongoose";

const foldersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
