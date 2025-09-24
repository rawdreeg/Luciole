import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * @interface AuthenticatedRequest
 * @extends {Request}
 * @description Extends the Express Request interface to include an optional `user` object.
 * This object contains the decoded JWT payload, including the user's ID.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

/**
 * Middleware for authenticating requests using JWT.
 * It checks for a token in the `Authorization` header, verifies it, and attaches
 * the decoded user information to the request object.
 * @param {AuthenticatedRequest} req - The Express request object, extended with user information.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Response | void} A response with a 401 status if authentication fails, otherwise calls the next middleware.
 */
export const auth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};