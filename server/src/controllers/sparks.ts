import { Request, Response } from "express";
import { SparkService } from "../services/SparkService";
import { insertSparkSchema } from "@shared/zod";
import { nanoid } from "nanoid";

export class SparkController {
  constructor(private sparkService: SparkService) {}

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
