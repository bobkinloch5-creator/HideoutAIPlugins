import { useEffect, useState, useRef } from "react";
import { useAuth } from "./useAuth";

interface PluginMessage {
  type: "generate" | "status" | "ping";
  prompt?: string;
  projectId?: string;
}

interface PluginResponse {
  type: "generated" | "error" | "pong";
  code?: string;
  commandType?: string;
  commandId?: string;
  error?: string;
}

export function usePluginConnection(projectId: string) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !projectId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/plugin/ws?projectId=${projectId}&userId=${user.id}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Plugin] Connected to dashboard");
        setIsConnected(true);
        setLastError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: PluginResponse = JSON.parse(event.data);
          if (message.type === "generated") {
            console.log("[Plugin] Code generated:", message.commandId);
            // Emit custom event for components to listen to
            window.dispatchEvent(
              new CustomEvent("plugin:codeGenerated", { detail: message })
            );
          }
        } catch (error) {
          console.error("[Plugin] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[Plugin] WebSocket error:", error);
        setLastError("Plugin connection error");
      };

      ws.onclose = () => {
        console.log("[Plugin] Disconnected from dashboard");
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[Plugin] Failed to create WebSocket:", error);
      setLastError("Failed to connect to plugin");
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id, projectId]);

  const sendToPlugin = (message: PluginMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[Plugin] WebSocket not connected");
      setLastError("Plugin not connected");
    }
  };

  return {
    isConnected,
    sendToPlugin,
    lastError,
  };
}
