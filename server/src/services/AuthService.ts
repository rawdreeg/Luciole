import { storage } from "../storage";
import { InsertUser, User } from "@shared/zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @class AuthService
 * @description Provides services for user authentication, including user creation and login.
 * This class handles password hashing and JWT generation.
 */
export class AuthService {
  /**
   * Creates a new user.
   * It hashes the user's password before storing it in the database.
   * @param {InsertUser} userData - The user data, including the plaintext password.
   * @returns {Promise<User>} A promise that resolves to the newly created user.
   */
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      ...userData,
      password: hashedPassword,
    };
    return await storage.createUser(newUser);
  }

  /**
   * Authenticates a user.
   * It retrieves the user by username, compares the provided password with the stored hash,
   * and generates a JWT if the credentials are valid.
   * @param {string} username - The user's username.
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<string | null>} A promise that resolves to a JWT string, or null if authentication fails.
   */
  async login(username: string, password: string): Promise<string | null> {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return token;
  }
}