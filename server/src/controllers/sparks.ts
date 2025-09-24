import { Request, Response } from "express";
import { SparkService } from "../services/SparkService";
import { insertSparkSchema } from "@shared/zod";
import { nanoid } from "nanoid";

/**
 * @class SparkController
 * @description Handles all spark-related requests, including creation, retrieval,
 * and management of spark connections. This controller delegates the business
 * logic to a `SparkService`.
 */
export class SparkController {
  /**
   * @constructor
   * @param {SparkService} sparkService - An instance of the SparkService.
   */
  constructor(private sparkService: SparkService) {}

  /**
   * Creates a new spark.
   * It generates a unique ID for the spark, sets an expiration date, and allows
   * for a custom flash color. The new spark is then saved to the database via the `SparkService`.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  createSpark = async (req: Request, res: Response) => {
    try {
      const { flashColor = "#FFB800" } = req.body;
      const sparkId = `FLY-${nanoid(6).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const sparkData = insertSparkSchema.parse({
        id: sparkId,
        flashColor,
        expiresAt,
        isActive: true,
      });

      const spark = await this.sparkService.createSpark(sparkData);
      res.json(spark);
    } catch (error) {
      res.status(400).json({ message: "Failed to create spark" });
    }
  };

  /**
   * Retrieves a spark by its ID.
   * It fetches the spark details from the database and checks if the spark
   * has expired.
   * @param {Request} req - The Express request object, containing the spark ID.
   * @param {Response} res - The Express response object.
   * @returns {Promise<Response>} A promise that resolves to the Express response.
   */
  getSpark = async (req: Request, res: Response) => {
    try {
      const spark = await this.sparkService.getSpark(req.params.id);
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }

      if (spark.expiresAt < new Date()) {
        return res.status(410).json({ message: "Spark expired" });
      }

      res.json(spark);
    } catch (error) {
      res.status(500).json({ message: "Failed to get spark" });
    }
  };

  /**
   * Retrieves all connections for a given spark.
   * It first verifies that the spark exists, then fetches all associated
   * connections from the database.
   * @param {Request} req - The Express request object, containing the spark ID.
   * @param {Response} res - The Express response object.
   * @returns {Promise<Response>} A promise that resolves to the Express response.
   */
  getSparkConnections = async (req: Request, res: Response) => {
    try {
      const spark = await this.sparkService.getSpark(req.params.id);
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }

      const connections = await this.sparkService.getConnectionsBySparkId(
        req.params.id
      );
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get connections" });
    }
  };
}
