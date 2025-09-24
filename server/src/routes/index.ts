import { Router } from "express";
import sparkRoutes from "./sparks";
import authRoutes from "./auth";

/**
 * The main router for the API.
 * This router combines all the other routers for different resources.
 * @type {Router}
 */
const router = Router();

/**
 * Mounts the authentication routes under the `/auth` path.
 */
router.use("/auth", authRoutes);

/**
 * Mounts the spark routes under the `/sparks` path.
 */
router.use("/sparks", sparkRoutes);

export default router;
