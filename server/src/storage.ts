import { users, sparks, sparkConnections } from "@shared/schema";
import { User, InsertUser, Spark, InsertSpark, SparkConnection, InsertSparkConnection } from "@shared/zod";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

/**
 * @interface IStorage
 * @description Defines the contract for all storage operations in the application.
 * This interface includes methods for user management, spark and connection handling,
 * as well as cleanup tasks.
 */
export interface IStorage {
  /**
   * Creates a new user in the database.
   * @param {InsertUser} user - The user data to be inserted.
   * @returns {Promise<User>} A promise that resolves to the newly created user.
   */
  createUser(user: InsertUser): Promise<User>;

  /**
   * Retrieves a user by their username.
   * @param {string} username - The username to search for.
   * @returns {Promise<User | undefined>} A promise that resolves to the user, or undefined if not found.
   */
  getUserByUsername(username: string): Promise<User | undefined>;

  /**
   * Creates a new spark in the database.
   * @param {InsertSpark} spark - The spark data to be inserted.
   * @returns {Promise<Spark>} A promise that resolves to the newly created spark.
   */
  createSpark(spark: InsertSpark): Promise<Spark>;

  /**
   * Retrieves a spark by its ID.
   * @param {string} id - The ID of the spark to retrieve.
   * @returns {Promise<Spark | undefined>} A promise that resolves to the spark, or undefined if not found.
   */
  getSpark(id: string): Promise<Spark | undefined>;

  /**
   * Updates the activity status of a spark.
   * @param {string} id - The ID of the spark to update.
   * @param {boolean} isActive - The new activity status.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateSparkActivity(id: string, isActive: boolean): Promise<void>;

  /**
   * Creates a new connection in the database.
   * @param {InsertSparkConnection} connection - The connection data to be inserted.
   * @returns {Promise<SparkConnection>} A promise that resolves to the newly created connection.
   */
  createConnection(connection: InsertSparkConnection): Promise<SparkConnection>;

  /**
   * Retrieves all active connections for a given spark ID.
   * @param {string} sparkId - The ID of the spark.
   * @returns {Promise<SparkConnection[]>} A promise that resolves to an array of spark connections.
   */
  getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]>;

  /**
   * Updates the location of a connection.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @param {number} latitude - The new latitude.
   * @param {number} longitude - The new longitude.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateConnectionLocation(userId: string, sparkId: string, latitude: number, longitude: number): Promise<void>;

  /**
   * Updates the status of a connection.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @param {boolean} isConnected - The new connection status.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateConnectionStatus(userId: string, sparkId: string, isConnected: boolean): Promise<void>;

  /**
   * Retrieves a connection by user and spark ID.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @returns {Promise<SparkConnection | undefined>} A promise that resolves to the connection, or undefined if not found.
   */
  getConnectionByUserAndSpark(userId: string, sparkId: string): Promise<SparkConnection | undefined>;

  /**
   * Cleans up expired sparks and stale connections from the database.
   * @returns {Promise<void>} A promise that resolves when the cleanup is complete.
   */
  cleanupExpiredSparks(): Promise<void>;
}

/**
 * @class DatabaseStorage
 * @implements {IStorage}
 * @description Provides a concrete implementation of the IStorage interface using a database.
 * This class handles all interactions with the database for creating, retrieving, updating,
 * and deleting data related to users, sparks, and connections.
 */
export class DatabaseStorage implements IStorage {
  /**
   * @constructor
   * @description Initializes a new instance of the DatabaseStorage class and sets up a periodic cleanup task.
   */
  constructor() {
    // Setup cleanup interval
    setInterval(() => {
      this.cleanupExpiredSparks();
    }, 60000); // Cleanup every minute
  }

  /**
   * Creates a new user in the database.
   * @param {InsertUser} insertUser - The user data to be inserted.
   * @returns {Promise<User>} A promise that resolves to the newly created user.
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  /**
   * Retrieves a user by their username.
   * @param {string} username - The username to search for.
   * @returns {Promise<User | undefined>} A promise that resolves to the user, or undefined if not found.
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  /**
   * Creates a new spark in the database.
   * @param {InsertSpark} insertSpark - The spark data to be inserted.
   * @returns {Promise<Spark>} A promise that resolves to the newly created spark.
   */
  async createSpark(insertSpark: InsertSpark): Promise<Spark> {
    const [spark] = await db
      .insert(sparks)
      .values(insertSpark)
      .returning();
    return spark;
  }

  /**
   * Retrieves a spark by its ID.
   * @param {string} id - The ID of the spark to retrieve.
   * @returns {Promise<Spark | undefined>} A promise that resolves to the spark, or undefined if not found.
   */
  async getSpark(id: string): Promise<Spark | undefined> {
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, id));
    return spark || undefined;
  }

  /**
   * Updates the activity status of a spark.
   * @param {string} id - The ID of the spark to update.
   * @param {boolean} isActive - The new activity status.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateSparkActivity(id: string, isActive: boolean): Promise<void> {
    await db
      .update(sparks)
      .set({ isActive })
      .where(eq(sparks.id, id));
  }

  /**
   * Creates a new connection in the database.
   * @param {InsertSparkConnection} insertConnection - The connection data to be inserted.
   * @returns {Promise<SparkConnection>} A promise that resolves to the newly created connection.
   */
  async createConnection(insertConnection: InsertSparkConnection): Promise<SparkConnection> {
    const [connection] = await db
      .insert(sparkConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  /**
   * Retrieves all active connections for a given spark ID.
   * @param {string} sparkId - The ID of the spark.
   * @returns {Promise<SparkConnection[]>} A promise that resolves to an array of spark connections.
   */
  async getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]> {
    return await db
      .select()
      .from(sparkConnections)
      .where(and(
        eq(sparkConnections.sparkId, sparkId),
        eq(sparkConnections.isConnected, true)
      ));
  }

  /**
   * Updates the location of a connection.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @param {number} latitude - The new latitude.
   * @param {number} longitude - The new longitude.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateConnectionLocation(userId: string, sparkId: string, latitude: number, longitude: number): Promise<void> {
    await db
      .update(sparkConnections)
      .set({ 
        latitude, 
        longitude, 
        lastSeen: new Date() 
      })
      .where(and(
        eq(sparkConnections.userId, userId),
        eq(sparkConnections.sparkId, sparkId)
      ));
  }

  /**
   * Updates the status of a connection.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @param {boolean} isConnected - The new connection status.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateConnectionStatus(userId: string, sparkId: string, isConnected: boolean): Promise<void> {
    await db
      .update(sparkConnections)
      .set({ 
        isConnected, 
        lastSeen: new Date() 
      })
      .where(and(
        eq(sparkConnections.userId, userId),
        eq(sparkConnections.sparkId, sparkId)
      ));
  }

  /**
   * Retrieves a connection by user and spark ID.
   * @param {string} userId - The ID of the user.
   * @param {string} sparkId - The ID of the spark.
   * @returns {Promise<SparkConnection | undefined>} A promise that resolves to the connection, or undefined if not found.
   */
  async getConnectionByUserAndSpark(userId: string, sparkId: string): Promise<SparkConnection | undefined> {
    const [connection] = await db
      .select()
      .from(sparkConnections)
      .where(and(
        eq(sparkConnections.userId, userId),
        eq(sparkConnections.sparkId, sparkId)
      ));
    return connection || undefined;
  }

  /**
   * Cleans up expired sparks and stale connections from the database.
   * This method deletes sparks that have passed their expiration date and connections
   * that have been inactive for more than five minutes.
   * @returns {Promise<void>} A promise that resolves when the cleanup is complete.
   */
  async cleanupExpiredSparks(): Promise<void> {
    const now = new Date();
    
    // Remove expired sparks
    await db
      .delete(sparks)
      .where(sql`${sparks.expiresAt} < ${now}`);
    
    // Remove stale connections (not seen for 5 minutes)
    const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);
    await db
      .delete(sparkConnections)
      .where(sql`${sparkConnections.lastSeen} < ${staleThreshold}`);
  }
}

/**
 * A singleton instance of the DatabaseStorage class.
 * This instance is used throughout the application to interact with the database.
 * @type {DatabaseStorage}
 */
export const storage = new DatabaseStorage();
