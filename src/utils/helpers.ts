/**
 * Returns today's date at midnight UTC (for consistent daily comparisons).
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Checks if two dates fall on the same UTC calendar day.
 */
export function isSameUTCDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Strips sensitive fields from a user document before sending to client.
 */
export function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash, __v, ...safe } = user;
  return safe;
}
