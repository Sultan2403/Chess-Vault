import mongoose from "mongoose";
import { PLANS_CONFIG, planTypes } from "../../Config/constants";

const accountsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      tier: {
        type: String,
        enum: planTypes,
        default: "free",
        required: true,
      },

      gameBankLimit: {
        type: Number,
        default: PLANS_CONFIG.free.gameBankLimit,
        required: true,
      },

      linkedAccountLimit: {
        type: Number,
        default: PLANS_CONFIG.free.linkedAccountLimit,
        required: true,
      },

      aiEnabled: {
        type: Boolean,
        default: PLANS_CONFIG.free.aiEnabled,
        required: true,
      },

      analyticsEnabled: {
        type: Boolean,
        default: PLANS_CONFIG.free.analyticsEnabled,
        required: true,
      },

      sharingEnabled: {
        type: Boolean,
        default: PLANS_CONFIG.free.sharingEnabled,
        required: true,
      },
    },
  },
  { strict: true, timestamps: true },
);

accountsSchema.set("toJSON", {
  transform: (_, obj) => {
    const { _id, __v, ...rest } = obj;

    return {
      id: _id.toString(),
      ...rest,
    };
  },
});

const Accounts = mongoose.model("accounts", accountsSchema, "accounts");

export default Accounts;
