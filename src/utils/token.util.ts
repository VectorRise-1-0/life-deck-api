import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";
import type { StringValue } from "ms";

export function signAccessToken(user: IUser): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_TTL as StringValue) || "15m",
  };

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
    },
    secret,
    options,
  );
}
