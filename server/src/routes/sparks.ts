import { Router } from "express";
import { SparkController } from "../controllers/sparks";
import { SparkService } from "../services/SparkService";
import { validate } from "../middleware/validate";
import { createSparkSchema, getSparkSchema } from "../schemas/spark";
import { auth } from "../middleware/auth";

/**
 * The router for spark-related endpoints.
 * @type {Router}
 */
const router = Router();

/**
 * The spark service instance.
 * @type {SparkService}
 */
const sparkService = new SparkService();

/**
 * The spark controller instance.
 * @type {SparkController}
 */
const sparkController = new SparkController(sparkService);

/**
 * Middleware to authenticate all spark routes.
 */
router.use(auth);

/**
 * @route POST /api/sparks
 * @description Creates a new spark.
 * @access Private
 */
router.post("/", validate(createSparkSchema), sparkController.createSpark);

/**
 * @route GET /api/sparks/:id
 * @description Retrieves a spark by its ID.
 * @access Private
 */
router.get("/:id", validate(getSparkSchema), sparkController.getSpark);

/**
 * @route GET /api/sparks/:id/connections
 * @description Retrieves all connections for a given spark.
 * @access Private
 */
router.get(
  "/:id/connections",
  validate(getSparkSchema),
  sparkController.getSparkConnections
);

export default router;