import { Router } from "express";
import { SparkController } from "../controllers/sparks";
import { SparkService } from "../services/SparkService";
import { validate } from "../middleware/validate";
import { createSparkSchema, getSparkSchema } from "../schemas/spark";
import { auth } from "../middleware/auth";

const router = Router();
const sparkService = new SparkService();
const sparkController = new SparkController(sparkService);

router.use(auth);

router.post("/", validate(createSparkSchema), sparkController.createSpark);
router.get("/:id", validate(getSparkSchema), sparkController.getSpark);
router.get(
  "/:id/connections",
  validate(getSparkSchema),
  sparkController.getSparkConnections
);

export default router;