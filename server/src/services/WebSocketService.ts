import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { wsMessageSchema } from "@shared/zod";
import { storage } from "../storage";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  sparkId?: string;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private activeConnections = new Map<string, ExtendedWebSocket>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.wss.on("connection", this.handleConnection);
  }

  private handleConnection = (ws: ExtendedWebSocket) => {
    console.log("New WebSocket connection");

    ws.on("message", async (data) => {
      try {
        const message = wsMessageSchema.parse(JSON.parse(data.toString()));

        switch (message.type) {
          case "join":
            await this.handleJoin(ws, message.sparkId, message.userId);
            break;
          case "location":
            if (ws.userId && ws.sparkId) {
              await this.handleLocationUpdate(
                ws,
                message.latitude,
                message.longitude
              );
            }
            break;
          case "sync":
            if (ws.userId && ws.sparkId) {
              this.broadcast(ws.sparkId, {
                type: "sync_signal",
                timestamp: message.timestamp,
                fromUser: ws.userId,
              });
            }
            break;
          case "flash":
            if (ws.userId && ws.sparkId) {
              const spark = await storage.getSpark(ws.sparkId);
              this.broadcast(ws.sparkId, {
                type: "flash_signal",
                timestamp: message.timestamp,
                synchronized: message.synchronized || false,
                color: spark?.flashColor || "#FFB800",
                fromUser: ws.userId,
              });
            }
            break;
          case "start_constant_blink":
            if (ws.userId && ws.sparkId) {
              const spark = await storage.getSpark(ws.sparkId);
              this.broadcast(ws.sparkId, {
                type: "start_constant_blink_signal",
                timestamp: message.timestamp,
                color: spark?.flashColor || "#FFB800",
                fromUser: ws.userId,
              });
            }
            break;
          case "stop_constant_blink":
            if (ws.userId && ws.sparkId) {
              this.broadcast(ws.sparkId, {
                type: "stop_constant_blink_signal",
                timestamp: message.timestamp,
                fromUser: ws.userId,
              });
            }
            break;
          case "disconnect":
            if (ws.userId && ws.sparkId) {
              await this.handleDisconnection(ws);
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.on("close", async () => {
      if (ws.userId && ws.sparkId) {
        await this.handleDisconnection(ws);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  };

  private handleJoin = async (
    ws: ExtendedWebSocket,
    sparkId: string,
    userId: string
  ) => {
    const spark = await storage.getSpark(sparkId);
    if (!spark || spark.expiresAt < new Date()) {
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid or expired spark" })
      );
      return;
    }

    ws.userId = userId;
    ws.sparkId = sparkId;
    this.activeConnections.set(`${sparkId}-${userId}`, ws);

    const existingConnection = await storage.getConnectionByUserAndSpark(
      userId,
      sparkId
    );
    if (!existingConnection) {
      await storage.createConnection({
        sparkId,
        userId,
        isConnected: true,
        latitude: null,
        longitude: null,
      });
    } else {
      await storage.updateConnectionStatus(userId, sparkId, true);
    }

    const connections = await storage.getConnectionsBySparkId(sparkId);
    this.broadcast(sparkId, {
      type: "user_joined",
      userId: userId,
      connections: connections.length,
    });

    ws.send(
      JSON.stringify({
        type: "joined",
        sparkId,
        connections: connections.length,
      })
    );
  };

  private handleLocationUpdate = async (
    ws: ExtendedWebSocket,
    latitude: number,
    longitude: number
  ) => {
    if (!ws.userId || !ws.sparkId) return;

    await storage.updateConnectionLocation(
      ws.userId,
      ws.sparkId,
      latitude,
      longitude
    );

    const sparkConnections = await storage.getConnectionsBySparkId(ws.sparkId);
    this.broadcast(
      ws.sparkId,
      {
        type: "location_update",
        userId: ws.userId,
        latitude,
        longitude,
        otherUsers: sparkConnections
          .filter((c) => c.latitude && c.longitude)
          .map((c) => ({
            userId: c.userId,
            latitude: c.latitude,
            longitude: c.longitude,
          })),
      },
      ws.userId
    );
  };

  private handleDisconnection = async (ws: ExtendedWebSocket) => {
    if (!ws.userId || !ws.sparkId) return;

    this.activeConnections.delete(`${ws.sparkId}-${ws.userId}`);
    await storage.updateConnectionStatus(ws.userId, ws.sparkId, false);

    const connections = await storage.getConnectionsBySparkId(ws.sparkId);
    this.broadcast(
      ws.sparkId,
      {
        type: "user_left",
        userId: ws.userId,
        connections: connections.length,
      },
      ws.userId
    );
  };

  private broadcast = (
    sparkId: string,
    message: any,
    excludeUserId?: string
  ) => {
    this.activeConnections.forEach((client, key) => {
      if (
        client.sparkId === sparkId &&
        client.readyState === WebSocket.OPEN &&
        client.userId !== excludeUserId
      ) {
        client.send(JSON.stringify(message));
      }
    });
  };
}
