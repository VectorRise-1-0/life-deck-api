import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/jwt";

/**
 * Protects a route based on roles.
 * @param allowedRoles Array of roles that can access the route
 */

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}
