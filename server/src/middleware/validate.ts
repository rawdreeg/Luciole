import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Middleware for validating request data against a Zod schema.
 * This function returns a middleware that parses and validates the request's
 * body, query parameters, and URL parameters against the provided schema.
 * If validation fails, it sends a 400 response with the validation errors.
 * @param {z.ZodObject<any, any>} schema - The Zod schema to validate against.
 * @returns {Function} An Express middleware function.
 */
export const validate =
  (schema: z.ZodObject<any, any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
