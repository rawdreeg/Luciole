import { describe, it, expect, vi, beforeEach } from "vitest";
import { SparkController } from "../controllers/sparks";
import { SparkService } from "../services/SparkService";
import { storage } from "../storage";

vi.mock("../storage", () => ({
  storage: {
    createSpark: vi.fn(),
    getSpark: vi.fn(),
    getConnectionsBySparkId: vi.fn(),
  },
}));

describe("SparkController", () => {
  const sparkService = new SparkService();
  const sparkController = new SparkController(sparkService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSpark", () => {
    it("should create a new spark", async () => {
      // Arrange
      const spark = {
        id: "FLY-123456",
        flashColor: "#FFB800",
        expiresAt: new Date(),
        isActive: true,
      };
      (storage.createSpark as any).mockResolvedValue(spark);
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
      (storage.getSpark as any).mockResolvedValue(spark);
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
      (storage.getSpark as any).mockResolvedValue(expiredSpark);
      const req: any = { params: { id: "SPK-123" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSpark(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(410);
    });

    it("should return 404 Not Found when the spark does not exist", async () => {
      // Arrange
      (storage.getSpark as any).mockResolvedValue(undefined);
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
      const spark = { id: "SPK-123", expiresAt: new Date(Date.now() + 1000 * 60 * 60) };
      const connections = [{ userId: "USR-123" }];
      (storage.getSpark as any).mockResolvedValue(spark);
      (storage.getConnectionsBySparkId as any).mockResolvedValue(connections);
      const req: any = { params: { id: "SPK-123" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSparkConnections(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(connections);
    });

    it("should return 404 Not Found when the spark does not exist", async () => {
      // Arrange
      (storage.getSpark as any).mockResolvedValue(undefined);
      const req: any = { params: { id: "SPK-789" } };
      const res: any = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      // Act
      await sparkController.getSparkConnections(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});