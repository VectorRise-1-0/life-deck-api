import { Schema, model, Document, Types } from "mongoose";

export type SubscriptionStatus = "FREE" | "PREMIUM";
export type Role = "free_user" | "premium_user" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
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
    password: { type: String, required: true },
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
