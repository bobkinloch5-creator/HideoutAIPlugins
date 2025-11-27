import { Server as HTTPServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";
import { generateRobloxCode, classifyPrompt } from "./gemini";

interface PluginClient {
  ws: WebSocket & { isAlive?: boolean };
  projectId: string;
  userId: string;
  isAlive: boolean;
}

const pluginClients = new Map<string, PluginClient>();

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server, path: "/api/plugin/ws" });

  wss.on("connection", (ws: WebSocket & { isAlive?: boolean }, req) => {
    const params = new URLSearchParams(req.url?.split("?")[1] || "");
    const projectId = params.get("projectId");
    const userId = params.get("userId");

    if (!projectId || !userId) {
      ws.close(1008, "Missing projectId or userId");
      return;
    }

    const clientId = `${userId}:${projectId}`;
    const client: PluginClient = { ws, projectId, userId, isAlive: true };
    pluginClients.set(clientId, client);

    console.log(`[WebSocket] Plugin connected: ${clientId}`);

    // Heartbeat
    ws.isAlive = true;
    ws.on("pong", () => {
      if (ws.isAlive !== undefined) ws.isAlive = true;
    });

    // Handle messages from plugin
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "generate") {
          const { prompt } = message;

          // Generate code
          const project = await storage.getProject(projectId);
          if (!project) {
            ws.send(JSON.stringify({ error: "Project not found" }));
            return;
          }

          const { code, commandType } = await generateRobloxCode({
            prompt,
            projectType: project.projectType,
          });

          // Save to database
          const command = await storage.createCommand({
            projectId: projectId,
            userId: userId,
            prompt: prompt.trim(),
            generatedCode: code,
            commandType,
            status: "completed",
          });

          // Send back to plugin
          ws.send(
            JSON.stringify({
              type: "generated",
              code,
              commandType,
              commandId: command.id,
            })
          );

          // Broadcast to dashboard
          broadcastToDashboard(userId, projectId, {
            type: "codeGenerated",
            code,
            commandType,
            commandId: command.id,
            prompt,
          });
        }
      } catch (error) {
        console.error("[WebSocket] Error processing message:", error);
        ws.send(
          JSON.stringify({
            error: "Failed to process request",
          })
        );
      }
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Error for ${clientId}:`, error);
    });

    ws.on("close", () => {
      pluginClients.delete(clientId);
      console.log(`[WebSocket] Plugin disconnected: ${clientId}`);
    });
  });

  // Heartbeat interval
  setInterval(() => {
    wss.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
}

// Send message to plugin
export function sendToPlugin(
  userId: string,
  projectId: string,
  message: any
) {
  const clientId = `${userId}:${projectId}`;
  const client = pluginClients.get(clientId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

// Broadcast to dashboard
export function broadcastToDashboard(
  userId: string,
  projectId: string,
  message: any
) {
  // This will be handled by the frontend polling/subscribing to project commands
  // The frontend will automatically fetch the latest commands
}

export function isPluginConnected(userId: string, projectId: string): boolean {
  const clientId = `${userId}:${projectId}`;
  const client = pluginClients.get(clientId);
  return client ? client.ws.readyState === WebSocket.OPEN : false;
}
