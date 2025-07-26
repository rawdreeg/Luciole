import { useEffect, useRef, useState } from "react";
import type { WSMessage } from "@shared/schema";

interface UseWebSocketOptions {
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log("Connecting to WebSocket:", wsUrl);
      ws.current = new WebSocket(wsUrl);
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnected(false);
      return;
    }

    ws.current.onopen = () => {
      setIsConnected(true);
      options.onConnect?.();
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        options.onMessage?.(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
      options.onDisconnect?.();
      console.log("WebSocket disconnected", event.code, event.reason);
      
      // Only attempt to reconnect if it wasn't a manual close
      if (event.code !== 1000) {
        reconnectTimer.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  const sendMessage = (message: WSMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const disconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (ws.current) {
      ws.current.close();
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
