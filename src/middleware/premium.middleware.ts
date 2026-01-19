import { Request, Response, NextFunction } from "express";

export function requirePremium(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (user.subscriptionStatus !== "PREMIUM") {
    return res.status(403).json({ error: "Forbidden: premium required" });
  }

  next();
}
