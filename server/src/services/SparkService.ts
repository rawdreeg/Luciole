import { storage } from "../storage";
import { InsertSpark } from "@shared/zod";

export class SparkService {
  async createSpark(sparkData: InsertSpark) {
    return await storage.createSpark(sparkData);
  }

  async getSpark(id: string) {
    return await storage.getSpark(id);
  }

  async getConnectionsBySparkId(sparkId: string) {
    return await storage.getConnectionsBySparkId(sparkId);
  }
}
