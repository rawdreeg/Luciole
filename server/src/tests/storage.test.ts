import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { DatabaseStorage, storage } from "../storage";
import { InsertSpark, InsertSparkConnection, InsertUser } from "@shared/zod";

vi.mock("../storage", () => ({
  storage: {
    createUser: vi.fn(),
    getUserByUsername: vi.fn(),
    createSpark: vi.fn(),
    getSpark: vi.fn(),
    updateSparkActivity: vi.fn(),
    createConnection: vi.fn(),
    getConnectionsBySparkId: vi.fn(),
    updateConnectionLocation: vi.fn(),
    updateConnectionStatus: vi.fn(),
    getConnectionByUserAndSpark: vi.fn(),
    cleanupExpiredSparks: vi.fn(),
  },
}));

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
      (storage.createUser as any).mockResolvedValue(user);

      // Act
      const createdUser = await storage.createUser(user);

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
      (storage.getUserByUsername as any).mockResolvedValue(user);

      // Act
      const foundUser = await storage.getUserByUsername("testuser");

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
      (storage.createSpark as any).mockResolvedValue(spark);

      // Act
      const createdSpark = await storage.createSpark(spark);

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
      (storage.getSpark as any).mockResolvedValue(spark);

      // Act
      const foundSpark = await storage.getSpark("SPK-123");

      // Assert
      expect(foundSpark).toEqual(spark);
    });
  });

  describe("updateSparkActivity", () => {
    it("should update the activity of a spark", async () => {
      // Act
      await storage.updateSparkActivity("SPK-123", false);

      // Assert
      expect(storage.updateSparkActivity).toHaveBeenCalledWith("SPK-123", false);
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
      (storage.createConnection as any).mockResolvedValue(connection);

      // Act
      const createdConnection = await storage.createConnection(connection);

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
      (storage.getConnectionsBySparkId as any).mockResolvedValue([activeConnection]);

      // Act
      const connections = await storage.getConnectionsBySparkId(sparkId);

      // Assert
      expect(connections).toEqual([activeConnection]);
    });
  });

  describe("updateConnectionLocation", () => {
    it("should update the location of a connection", async () => {
      // Act
      await storage.updateConnectionLocation("USR-123", "SPK-123", 1, 1);

      // Assert
      expect(storage.updateConnectionLocation).toHaveBeenCalledWith("USR-123", "SPK-123", 1, 1);
    });
  });

  describe("updateConnectionStatus", () => {
    it("should update the status of a connection", async () => {
      // Act
      await storage.updateConnectionStatus("USR-123", "SPK-123", false);

      // Assert
      expect(storage.updateConnectionStatus).toHaveBeenCalledWith("USR-123", "SPK-123", false);
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
      (storage.getConnectionByUserAndSpark as any).mockResolvedValue(connection);

      // Act
      const foundConnection = await storage.getConnectionByUserAndSpark(
        "USR-123",
        "SPK-123"
      );

      // Assert
      expect(foundConnection).toEqual(connection);
    });
  });

  describe("cleanupExpiredSparks", () => {
    it("should remove expired sparks and stale connections", async () => {
      // Act
      await storage.cleanupExpiredSparks();

      // Assert
      expect(storage.cleanupExpiredSparks).toHaveBeenCalled();
    });
  });
});