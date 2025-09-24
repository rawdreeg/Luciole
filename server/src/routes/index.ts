import { Router } from "express";
import sparkRoutes from "./sparks";
import authRoutes from "./auth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/sparks", sparkRoutes);

export default router;
