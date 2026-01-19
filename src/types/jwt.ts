export type UserRole = "free_user" | "premium_user" | "admin";
export type SubscriptionStatus = "FREE" | "PREMIUM";

export interface JwtPayload {
  sub: string; // userId
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
}
