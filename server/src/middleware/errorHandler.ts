import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware.
 * This function catches errors from the application and sends a standardized
 * JSON response to the client. It determines the status code and message from
 * the error object, or defaults to a 500 Internal Server Error.
 * @param {any} err - The error object.
 * @param {Request} _req - The Express request object (unused).
 * @param {Response} res - The Express response object.
 * @param {NextFunction} _next - The next middleware function (unused).
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};
