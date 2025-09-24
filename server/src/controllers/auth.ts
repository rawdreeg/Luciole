import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { insertUserSchema } from "@shared/zod";

export class AuthController {
  constructor(private authService: AuthService) {}

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