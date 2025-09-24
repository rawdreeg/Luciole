import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { AuthService } from "../services/AuthService";

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;