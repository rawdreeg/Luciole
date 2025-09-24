import { storage } from "../storage";
import { InsertUser, User } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      ...userData,
      password: hashedPassword,
    };
    return await storage.createUser(newUser);
  }

  async login(username: string, password: string): Promise<string | null> {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    return token;
  }
}