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
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // In development, connect directly to the backend server port (5000)
    // In production, use the same host and port as the current page
    let wsUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
      // Development or Replit environment - backend runs on the same host
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // Production environment
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    
    console.log("Connecting to WebSocket:", wsUrl);
    ws.current = new WebSocket(wsUrl);

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

    ws.current.onclose = () => {
      setIsConnected(false);
      options.onDisconnect?.();
      console.log("WebSocket disconnected");
      
      // Attempt to reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, 3000);
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
