import { type Spark, type InsertSpark, type SparkConnection, type InsertSparkConnection } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private sparks: Map<string, Spark>;
  private connections: Map<string, SparkConnection>;

  constructor() {
    this.sparks = new Map();
    this.connections = new Map();
    
    // Setup cleanup interval
    setInterval(() => {
      this.cleanupExpiredSparks();
    }, 60000); // Cleanup every minute
  }

  async createSpark(insertSpark: InsertSpark): Promise<Spark> {
    const spark: Spark = {
      ...insertSpark,
      createdAt: new Date(),
      isActive: insertSpark.isActive ?? true,
    };
    this.sparks.set(spark.id, spark);
    return spark;
  }

  async getSpark(id: string): Promise<Spark | undefined> {
    return this.sparks.get(id);
  }

  async updateSparkActivity(id: string, isActive: boolean): Promise<void> {
    const spark = this.sparks.get(id);
    if (spark) {
      this.sparks.set(id, { ...spark, isActive });
    }
  }

  async createConnection(insertConnection: InsertSparkConnection): Promise<SparkConnection> {
    const id = randomUUID();
    const connection: SparkConnection = {
      ...insertConnection,
      id,
      lastSeen: new Date(),
      latitude: insertConnection.latitude ?? null,
      longitude: insertConnection.longitude ?? null,
      isConnected: insertConnection.isConnected ?? true,
    };
    this.connections.set(id, connection);
    return connection;
  }

  async getConnectionsBySparkId(sparkId: string): Promise<SparkConnection[]> {
    return Array.from(this.connections.values()).filter(
      (connection) => connection.sparkId === sparkId && connection.isConnected
    );
  }

  async updateConnectionLocation(userId: string, sparkId: string, latitude: number, longitude: number): Promise<void> {
    const connection = Array.from(this.connections.values()).find(
      (c) => c.userId === userId && c.sparkId === sparkId
    );
    if (connection) {
      this.connections.set(connection.id, {
        ...connection,
        latitude,
        longitude,
        lastSeen: new Date(),
      });
    }
  }

  async updateConnectionStatus(userId: string, sparkId: string, isConnected: boolean): Promise<void> {
    const connection = Array.from(this.connections.values()).find(
      (c) => c.userId === userId && c.sparkId === sparkId
    );
    if (connection) {
      this.connections.set(connection.id, {
        ...connection,
        isConnected,
        lastSeen: new Date(),
      });
    }
  }

  async getConnectionByUserAndSpark(userId: string, sparkId: string): Promise<SparkConnection | undefined> {
    return Array.from(this.connections.values()).find(
      (c) => c.userId === userId && c.sparkId === sparkId
    );
  }

  async cleanupExpiredSparks(): Promise<void> {
    const now = new Date();
    
    // Remove expired sparks
    Array.from(this.sparks.entries()).forEach(([id, spark]) => {
      if (spark.expiresAt < now) {
        this.sparks.delete(id);
        
        // Remove associated connections
        Array.from(this.connections.entries()).forEach(([connId, connection]) => {
          if (connection.sparkId === id) {
            this.connections.delete(connId);
          }
        });
      }
    });
    
    // Remove stale connections (not seen for 5 minutes)
    const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);
    Array.from(this.connections.entries()).forEach(([id, connection]) => {
      if (connection.lastSeen < staleThreshold) {
        this.connections.delete(id);
      }
    });
  }
}

export const storage = new MemStorage();
