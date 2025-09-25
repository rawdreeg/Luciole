import { describe, it, expect, vi } from "vitest";
import { SparkController } from "../controllers/sparks";
import { SparkService } from "../services/SparkService";
import { db } from "../db";

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  },
}));

describe("SparkController", () => {
  const sparkService = new SparkService();
  const sparkController = new SparkController(sparkService);

  describe("createSpark", () => {
    it("should create a new spark", async () => {
      // Arrange
      const spark = {
        id: "FLY-123456",
        flashColor: "#FFB800",
        expiresAt: new Date(),
        isActive: true,
      };
      (db.returning as any).mockResolvedValue([spark]);
      const req: any = { body: { flashColor: "#FFB800" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.createSpark(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(spark);
    });
  });

  describe("getSpark", () => {
    it("should return a spark by its ID", async () => {
      // Arrange
      const spark = {
        id: "SPK-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      (db.where as any).mockResolvedValue([spark]);
      const req: any = { params: { id: "SPK-123" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSpark(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(spark);
    });

    it("should return 410 Gone when the spark has expired", async () => {
      // Arrange
      const expiredSpark = {
        id: "SPK-123",
        expiresAt: new Date(Date.now() - 1000),
      };
      (db.where as any).mockResolvedValue([expiredSpark]);
      const req: any = { params: { id: "SPK-123" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSpark(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(410);
    });

    it("should return 404 Not Found when the spark does not exist", async () => {
      // Arrange
      (db.where as any).mockResolvedValue([]);
      const req: any = { params: { id: "SPK-456" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSpark(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getSparkConnections", () => {
    it("should return all connections for a given spark", async () => {
      // Arrange
      const spark = { id: "SPK-123" };
      const connections = [{ userId: "USR-123" }];
      (db.where as any).mockResolvedValueOnce([spark]);
      (db.where as any).mockResolvedValueOnce(connections);
      const req: any = { params: { id: "SPK-123" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSparkConnections(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(connections);
    });

    it("should return 404 Not Found when the spark does not exist", async () => {
      // Arrange
      (db.where as any).mockResolvedValue([]);
      const req: any = { params: { id: "SPK-789" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSparkConnections(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});