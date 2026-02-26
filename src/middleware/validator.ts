import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * Replaces req.body with the parsed (and potentially coerced) data on success.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}
