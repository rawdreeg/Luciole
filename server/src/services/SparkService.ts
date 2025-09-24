import { storage } from "../storage";
import { InsertSpark, Spark, SparkConnection } from "@shared/zod";

/**
 * @class SparkService
 * @description Provides services for managing sparks and their connections.
 * This class acts as an intermediary between the controllers and the storage layer.
 */
export class SparkService {
  /**
   * Creates a new spark.
   * @param {InsertSpark} sparkData - The data for the new spark.
   * @returns {Promise<Spark>} A promise that resolves to the newly created spark.
   */
  async createSpark(sparkData: InsertSpark): Promise<Spark> {
    return await storage.createSpark(sparkData);
  }

  /**
   * Retrieves a spark by its ID.
   * @param {string} id - The ID of the spark to retrieve.
   * @returns {Promise<Spark | undefined>} A promise that resolves to the spark, or undefined if not found.
   */
  async getSpark(id: string): Promise<Spark | undefined> {
    return await storage.getSpark(id);
  }

  /**
   * Retrieves all connections for a given spark ID.
   * @param {string} sparkId - The ID of the spark.
   * @returns {Promise<SparkConnection[]>} A promise that resolves to an array of spark connections.
   */
  async getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]> {
    return await storage.getConnectionsBySparkId(sparkId);
  }
}
