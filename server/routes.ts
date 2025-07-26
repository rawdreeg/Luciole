import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSparkSchema, insertSparkConnectionSchema, wsMessageSchema } from "@shared/schema";
import { nanoid } from "nanoid";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  sparkId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time synchronization
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const activeConnections = new Map<string, ExtendedWebSocket>();
  
  // Create spark endpoint
  app.post("/api/sparks", async (req, res) => {
    try {
      const sparkId = `FLY-${nanoid(6).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const sparkData = insertSparkSchema.parse({
        id: sparkId,
        expiresAt,
        isActive: true,
      });
      
      const spark = await storage.createSpark(sparkData);
      res.json(spark);
    } catch (error) {
      res.status(400).json({ message: "Failed to create spark" });
    }
  });
  
  // Get spark endpoint
  app.get("/api/sparks/:id", async (req, res) => {
    try {
      const spark = await storage.getSpark(req.params.id);
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }
      
      if (spark.expiresAt < new Date()) {
        return res.status(410).json({ message: "Spark expired" });
      }
      
      res.json(spark);
    } catch (error) {
      res.status(500).json({ message: "Failed to get spark" });
    }
  });
  
  // Get spark connections
  app.get("/api/sparks/:id/connections", async (req, res) => {
    try {
      const spark = await storage.getSpark(req.params.id);
      if (!spark) {
        return res.status(404).json({ message: "Spark not found" });
      }
      
      const connections = await storage.getConnectionsBySparkId(req.params.id);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get connections" });
    }
  });
  
  // WebSocket connection handling
  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = wsMessageSchema.parse(JSON.parse(data.toString()));
        
        switch (message.type) {
          case 'join':
            const { sparkId, userId } = message;
            
            // Verify spark exists and is active
            const spark = await storage.getSpark(sparkId);
            if (!spark || spark.expiresAt < new Date()) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid or expired spark' }));
              return;
            }
            
            // Store connection info
            ws.userId = userId;
            ws.sparkId = sparkId;
            activeConnections.set(`${sparkId}-${userId}`, ws);
            
            // Create or update connection in storage
            const existingConnection = await storage.getConnectionByUserAndSpark(userId, sparkId);
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
            
            // Notify other users in the same spark
            const connections = await storage.getConnectionsBySparkId(sparkId);
            const otherConnections = connections.filter(c => c.userId !== userId);
            
            otherConnections.forEach(connection => {
              const otherWs = activeConnections.get(`${sparkId}-${connection.userId}`);
              if (otherWs && otherWs.readyState === WebSocket.OPEN) {
                otherWs.send(JSON.stringify({
                  type: 'user_joined',
                  userId: userId,
                  connections: connections.length,
                }));
              }
            });
            
            ws.send(JSON.stringify({
              type: 'joined',
              sparkId,
              connections: connections.length,
            }));
            
            break;
            
          case 'location':
            if (ws.userId && ws.sparkId) {
              const { latitude, longitude } = message;
              
              console.log(`Location update from ${ws.userId}: ${latitude}, ${longitude}`);
              
              // Update location in storage
              await storage.updateConnectionLocation(ws.userId, ws.sparkId, latitude, longitude);
              
              // Get all connections for this spark
              const sparkConnections = await storage.getConnectionsBySparkId(ws.sparkId);
              const otherConnections = sparkConnections.filter(c => c.userId !== ws.userId);
              
              console.log(`Broadcasting to ${otherConnections.length} other users`);
              
              // Send location update to other users
              otherConnections.forEach(connection => {
                const otherWs = activeConnections.get(`${ws.sparkId}-${connection.userId}`);
                if (otherWs && otherWs.readyState === WebSocket.OPEN) {
                  const locationUpdate = {
                    type: 'location_update',
                    userId: ws.userId,
                    latitude,
                    longitude,
                    otherUsers: sparkConnections.filter(c => c.latitude && c.longitude).map(c => ({
                      userId: c.userId,
                      latitude: c.latitude,
                      longitude: c.longitude,
                    })),
                  };
                  console.log(`Sending location update to ${connection.userId}:`, locationUpdate);
                  otherWs.send(JSON.stringify(locationUpdate));
                }
              });
            }
            break;
            
          case 'sync':
            if (ws.userId && ws.sparkId) {
              const { timestamp } = message;
              
              // Broadcast sync signal to all users in the same spark
              const connections = await storage.getConnectionsBySparkId(ws.sparkId);
              connections.forEach(connection => {
                const otherWs = activeConnections.get(`${ws.sparkId}-${connection.userId}`);
                if (otherWs && otherWs.readyState === WebSocket.OPEN) {
                  otherWs.send(JSON.stringify({
                    type: 'sync_signal',
                    timestamp,
                    fromUser: ws.userId,
                  }));
                }
              });
            }
            break;
            
          case 'disconnect':
            if (ws.userId && ws.sparkId) {
              await handleDisconnection(ws);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', async () => {
      if (ws.userId && ws.sparkId) {
        await handleDisconnection(ws);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  async function handleDisconnection(ws: ExtendedWebSocket) {
    if (!ws.userId || !ws.sparkId) return;
    
    // Remove from active connections
    activeConnections.delete(`${ws.sparkId}-${ws.userId}`);
    
    // Update connection status in storage
    await storage.updateConnectionStatus(ws.userId, ws.sparkId, false);
    
    // Notify other users
    const connections = await storage.getConnectionsBySparkId(ws.sparkId);
    const otherConnections = connections.filter(c => c.userId !== ws.userId);
    
    otherConnections.forEach(connection => {
      const otherWs = activeConnections.get(`${ws.sparkId}-${connection.userId}`);
      if (otherWs && otherWs.readyState === WebSocket.OPEN) {
        otherWs.send(JSON.stringify({
          type: 'user_left',
          userId: ws.userId,
          connections: otherConnections.length,
        }));
      }
    });
  }

  return httpServer;
}
