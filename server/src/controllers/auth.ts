import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { insertUserSchema } from "@shared/zod";

/**
 * @class AuthController
 * @description Handles authentication-related requests, such as user registration and login.
 * This controller relies on an `AuthService` to perform the actual business logic.
 */
export class AuthController {
  /**
   * @constructor
   * @param {AuthService} authService - An instance of the AuthService.
   */
  constructor(private authService: AuthService) {}

  /**
   * Handles user registration.
   * It expects a username and password in the request body, validates them,
   * and then uses the `AuthService` to create a new user.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const newUser = insertUserSchema.parse({ username, password });
      const user = await this.authService.createUser(newUser);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to register user" });
    }
  };

  /**
   * Handles user login.
   * It expects a username and password in the request body and uses the `AuthService`
   * to authenticate the user. If the credentials are valid, it returns a JWT.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @returns {Promise<Response>} A promise that resolves to the Express response.
   */
  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const token = await this.authService.login(username, password);
      if (!token) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  };
}