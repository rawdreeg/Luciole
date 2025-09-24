import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { AuthService } from "../services/AuthService";

/**
 * The router for authentication-related endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * The authentication service instance.
 * @type {AuthService}
 */
const authService = new AuthService();

/**
 * The authentication controller instance.
 * @type {AuthController}
 */
const authController = new AuthController(authService);

/**
 * @route POST /api/auth/register
 * @description Registers a new user.
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route POST /api/auth/login
 * @description Logs in a user.
 * @access Public
 */
router.post("/login", authController.login);

export default router;