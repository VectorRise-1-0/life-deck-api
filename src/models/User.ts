import { Schema, model, Document } from "mongoose";

export type SubscriptionStatus = "FREE" | "PREMIUM";
export type Role = "free_user" | "premium_user" | "admin";

export interface IUser extends Document {
  email: string;
  subscriptionStatus: SubscriptionStatus;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["FREE", "PREMIUM"],
      default: "FREE",
    },
    role: {
      type: String,
      enum: ["free_user", "premium_user", "admin"],
      default: "free_user",
    },
  },
  {
    timestamps: true,
  },
);

export const User = model<IUser>("User", userSchema);
