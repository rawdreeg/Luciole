import { users, sparks, sparkConnections } from "@shared/schema";
import { User, InsertUser, Spark, InsertSpark, SparkConnection, InsertSparkConnection } from "@shared/zod";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Spark operations
  createSpark(spark: InsertSpark): Promise<Spark>;
  getSpark(id: string): Promise<Spark | undefined>;
  updateSparkActivity(id: string, isActive: boolean): Promise<void>;
  
  // Connection operations
  createConnection(connection: InsertSparkConnection): Promise<SparkConnection>;
  getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]>;
  updateConnectionLocation(userId: string, sparkId: string, latitude: number, longitude: number): Promise<void>;
  updateConnectionStatus(userId: string, sparkId: string, isConnected: boolean): Promise<void>;
  getConnectionByUserAndSpark(userId: string, sparkId: string): Promise<SparkConnection | undefined>;
  
  // Cleanup operations
  cleanupExpiredSparks(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Setup cleanup interval
    setInterval(() => {
      this.cleanupExpiredSparks();
    }, 60000); // Cleanup every minute
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createSpark(insertSpark: InsertSpark): Promise<Spark> {
    const [spark] = await db
      .insert(sparks)
      .values(insertSpark)
      .returning();
    return spark;
  }

  async getSpark(id: string): Promise<Spark | undefined> {
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, id));
    return spark || undefined;
  }

  async updateSparkActivity(id: string, isActive: boolean): Promise<void> {
    await db
      .update(sparks)
      .set({ isActive })
      .where(eq(sparks.id, id));
  }

  async createConnection(insertConnection: InsertSparkConnection): Promise<SparkConnection> {
    const [connection] = await db
      .insert(sparkConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]> {
    return await db
      .select()
      .from(sparkConnections)
      .where(and(
        eq(sparkConnections.sparkId, sparkId),
        eq(sparkConnections.isConnected, true)
      ));
  }

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

export const storage = new DatabaseStorage();
