import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateRobloxCode, classifyPrompt } from "./gemini";
import { insertProjectSchema, insertCommandSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User stats
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Projects CRUD
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertProjectSchema.parse(req.body);
      
      const project = await storage.createProject({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProject = await storage.updateProject(req.params.id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Commands
  app.get('/api/projects/:id/commands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const commands = await storage.getCommands(req.params.id);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching commands:", error);
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  // Generate code with AI using Gemini
  app.post('/api/projects/:id/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Generate code using Gemini
      const { code, commandType } = await generateRobloxCode({
        prompt: prompt.trim(),
        projectType: project.projectType,
      });
      
      const command = await storage.createCommand({
        projectId: project.id,
        userId,
        prompt: prompt.trim(),
        generatedCode: code,
        commandType,
        status: 'completed',
      });
      
      res.status(201).json(command);
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate code. Please try again." });
    }
  });

  // Plugin command endpoint (from plugin to generate code)
  app.post('/api/commands', async (req, res) => {
    try {
      const { prompt, projectId } = req.body;
      
      if (!projectId || !prompt) {
        return res.status(400).json({ message: "Project ID and prompt are required" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Generate code using Gemini
      const { code, commandType } = await generateRobloxCode({
        prompt: prompt.trim(),
        projectType: project.projectType,
      });
      
      const command = await storage.createCommand({
        projectId: projectId,
        userId: project.userId,
        prompt: prompt.trim(),
        generatedCode: code,
        commandType,
        status: 'completed',
      });
      
      res.status(201).json({ 
        generatedCode: code,
        commandType: commandType,
        commandId: command.id
      });
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });

  // Plugin download endpoint
  app.get('/api/plugin/download', (req, res) => {
    try {
      const pluginPath = path.join(__dirname, '../plugin/hideout-bot-plugin.lua');
      res.download(pluginPath, 'hideout-bot-plugin.lua', (err) => {
        if (err) {
          console.error("Error downloading plugin:", err);
        }
      });
    } catch (error) {
      console.error("Error downloading plugin:", error);
      res.status(500).json({ message: "Failed to download plugin" });
    }
  });

  // Plugin API endpoints (for Roblox plugin to fetch commands)
  app.get('/api/plugin/user/:userId/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects(req.params.userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/plugin/project/:projectId/commands', async (req, res) => {
    try {
      const commands = await storage.getCommands(req.params.projectId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching project commands:", error);
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  return httpServer;
}

// Generate demo code when OpenAI is not available
function generateDemoCode(prompt: string, projectType: string, commandType: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Obby templates
  if (projectType === 'obby' || lowerPrompt.includes('checkpoint')) {
    if (lowerPrompt.includes('checkpoint')) {
      return `-- Checkpoint System for Obby
-- Location: ServerScriptService

local Players = game:GetService("Players")
local checkpointsFolder = workspace:WaitForChild("Checkpoints")

-- Create leaderstats for each player
Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local stage = Instance.new("IntValue")
    stage.Name = "Stage"
    stage.Value = 1
    stage.Parent = leaderstats
end)

-- Handle checkpoint touches
for _, checkpoint in ipairs(checkpointsFolder:GetChildren()) do
    if checkpoint:IsA("BasePart") then
        checkpoint.Touched:Connect(function(hit)
            local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
            if humanoid then
                local player = Players:GetPlayerFromCharacter(hit.Parent)
                if player then
                    local stageNum = tonumber(checkpoint.Name:match("%d+")) or 1
                    local currentStage = player.leaderstats.Stage.Value
                    
                    if stageNum > currentStage then
                        player.leaderstats.Stage.Value = stageNum
                    end
                end
            end
        end)
    end
end

print("Checkpoint system initialized!")`;
    }
    
    if (lowerPrompt.includes('kill') || lowerPrompt.includes('brick')) {
      return `-- Kill Brick System
-- Location: ServerScriptService

local killBricksFolder = workspace:FindFirstChild("KillBricks")
if not killBricksFolder then
    killBricksFolder = Instance.new("Folder")
    killBricksFolder.Name = "KillBricks"
    killBricksFolder.Parent = workspace
end

for _, brick in ipairs(killBricksFolder:GetChildren()) do
    if brick:IsA("BasePart") then
        brick.BrickColor = BrickColor.new("Really red")
        brick.Touched:Connect(function(hit)
            local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
            if humanoid then
                humanoid.Health = 0
            end
        end)
    end
end

print("Kill bricks initialized!")`;
    }
  }
  
  // Tycoon templates
  if (projectType === 'tycoon' || lowerPrompt.includes('currency') || lowerPrompt.includes('cash')) {
    return `-- Tycoon Currency System
-- Location: ServerScriptService

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local cash = Instance.new("IntValue")
    cash.Name = "Cash"
    cash.Value = 100 -- Starting cash
    cash.Parent = leaderstats
end)

-- Function to add cash to a player
local function addCash(player, amount)
    local cash = player:FindFirstChild("leaderstats"):FindFirstChild("Cash")
    if cash then
        cash.Value = cash.Value + amount
    end
end

-- Make the function available to other scripts
_G.AddCash = addCash

print("Currency system initialized!")`;
  }
  
  // Racing templates
  if (projectType === 'racing' || lowerPrompt.includes('lap') || lowerPrompt.includes('race')) {
    return `-- Racing Lap Counter System
-- Location: ServerScriptService

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    local laps = Instance.new("IntValue")
    laps.Name = "Laps"
    laps.Value = 0
    laps.Parent = leaderstats
    
    local bestTime = Instance.new("NumberValue")
    bestTime.Name = "BestTime"
    bestTime.Value = 0
    bestTime.Parent = leaderstats
end)

print("Racing leaderstats initialized!")`;
  }
  
  // Default generic template
  return `-- Generated Lua Code
-- Location: ServerScriptService
-- Prompt: ${prompt}

-- This is a placeholder response.
-- To enable AI-powered code generation, please add your OpenAI API key.

local function setup()
    print("Hideout Bot - Code Generator")
    print("Prompt received: ${prompt.substring(0, 50)}...")
    
    -- Your generated code would appear here
    -- with full implementation based on your prompt
end

setup()

print("Script loaded successfully!")`;
}
