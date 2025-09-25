import { describe, it, expect, vi, afterEach } from "vitest";
import { DatabaseStorage } from "../storage";
import { InsertSpark, InsertSparkConnection, InsertUser } from "@shared/zod";
import { db } from "../db";

vi.mock("../db", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

const storage = new DatabaseStorage();

describe("DatabaseStorage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      // Arrange
      const user: InsertUser = {
        id: "USR-123",
        username: "testuser",
        password: "password",
      };
      (db.returning as any).mockResolvedValue([user]);
      const dbStorage = new DatabaseStorage();

      // Act
      const createdUser = await dbStorage.createUser(user);

      // Assert
      expect(createdUser).toEqual(user);
    });
  });

  describe("getUserByUsername", () => {
    it("should return a user by username", async () => {
      // Arrange
      const user: InsertUser = {
        id: "USR-123",
        username: "testuser",
        password: "password",
      };
      (db.where as any).mockResolvedValue([user]);
      const dbStorage = new DatabaseStorage();

      // Act
      const foundUser = await dbStorage.getUserByUsername("testuser");

      // Assert
      expect(foundUser).toEqual(user);
    });
  });

  describe("createSpark", () => {
    it("should create a new spark", async () => {
      // Arrange
      const spark: InsertSpark = {
        id: "SPK-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        flashColor: "#FF0000",
        isActive: true,
      };
      (db.returning as any).mockResolvedValue([spark]);
      const dbStorage = new DatabaseStorage();

      // Act
      const createdSpark = await dbStorage.createSpark(spark);

      // Assert
      expect(createdSpark).toEqual(spark);
    });
  });

  describe("getSpark", () => {
    it("should return a spark by id", async () => {
      // Arrange
      const spark: InsertSpark = {
        id: "SPK-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        flashColor: "#FF0000",
        isActive: true,
      };
      (db.where as any).mockResolvedValue([spark]);
      const dbStorage = new DatabaseStorage();

      // Act
      const foundSpark = await dbStorage.getSpark("SPK-123");

      // Assert
      expect(foundSpark).toEqual(spark);
    });
  });

  describe("updateSparkActivity", () => {
    it("should update the activity of a spark", async () => {
      const dbStorage = new DatabaseStorage();
      // Act
      await dbStorage.updateSparkActivity("SPK-123", false);

      // Assert
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("createConnection", () => {
    it("should create a new connection", async () => {
      // Arrange
      const connection: InsertSparkConnection = {
        userId: "USR-123",
        sparkId: "SPK-123",
        latitude: 0,
        longitude: 0,
        isConnected: true,
      };
      (db.returning as any).mockResolvedValue([connection]);
      const dbStorage = new DatabaseStorage();

      // Act
      const createdConnection = await dbStorage.createConnection(connection);

      // Assert
      expect(createdConnection).toEqual(connection);
    });
  });

  describe("getConnectionsBySparkId", () => {
    it("should return only active connections for a given spark", async () => {
      // Arrange
      const sparkId = "SPK-789";
      const activeConnection: InsertSparkConnection = {
        userId: "USR-123",
        sparkId,
        latitude: 0,
        longitude: 0,
        isConnected: true,
      };
      (db.where as any).mockResolvedValue([activeConnection]);
      const dbStorage = new DatabaseStorage();

      // Act
      const connections = await dbStorage.getConnectionsBySparkId(sparkId);

      // Assert
      expect(connections).toEqual([activeConnection]);
    });
  });

  describe("updateConnectionLocation", () => {
    it("should update the location of a connection", async () => {
      const dbStorage = new DatabaseStorage();
      // Act
      await dbStorage.updateConnectionLocation("USR-123", "SPK-123", 1, 1);

      // Assert
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("updateConnectionStatus", () => {
    it("should update the status of a connection", async () => {
      const dbStorage = new DatabaseStorage();
      // Act
      await dbStorage.updateConnectionStatus("USR-123", "SPK-123", false);

      // Assert
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("getConnectionByUserAndSpark", () => {
    it("should return a connection by user and spark id", async () => {
      // Arrange
      const connection: InsertSparkConnection = {
        userId: "USR-123",
        sparkId: "SPK-123",
        latitude: 0,
        longitude: 0,
        isConnected: true,
      };
      (db.where as any).mockResolvedValue([connection]);
      const dbStorage = new DatabaseStorage();

      // Act
      const foundConnection = await dbStorage.getConnectionByUserAndSpark(
        "USR-123",
        "SPK-123"
      );

      // Assert
      expect(foundConnection).toEqual(connection);
    });
  });

  describe("cleanupExpiredSparks", () => {
    it("should remove expired sparks and stale connections", async () => {
      const dbStorage = new DatabaseStorage();
      // Act
      await dbStorage.cleanupExpiredSparks();

      // Assert
      expect(db.delete).toHaveBeenCalledTimes(2);
    });
  });
});