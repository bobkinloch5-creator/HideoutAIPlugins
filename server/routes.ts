import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { generateRobloxCode, classifyPrompt } from "./gemini";
import { insertProjectSchema, insertCommandSchema } from "@shared/schema";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Debug endpoint for database connection
  app.get('/api/test-db', async (_req, res) => {
    try {
      const { pool } = await import('./db');
      // Parse host from connection string for debugging (safe to expose host usually, but let's be careful)
      const dbUrl = process.env.DATABASE_URL || '';
      const host = dbUrl.split('@')[1]?.split(':')[0] || 'unknown';

      const result = await pool.query('SELECT NOW()');
      res.json({ status: 'ok', time: result.rows[0], host });
    } catch (error: any) {
      console.error('Database connection test failed:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes - Modified to handle unauthenticated requests
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.json(null);
      }

      const userId = req.user.claims?.sub || req.user.id;
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
      const { name, description, projectType } = req.body;

      const project = await storage.createProject({
        userId,
        name,
        description: description || "",
        projectType: projectType || "custom",
      });

      res.status(201).json(project);
    } catch (error) {
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

  // Code History endpoints (Improvement #8)
  app.get('/api/projects/:projectId/history', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getCodeHistory(req.params.projectId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching code history:", error);
      res.status(500).json({ message: "Failed to fetch code history" });
    }
  });

  app.post('/api/projects/:projectId/history/:version/compare', isAuthenticated, async (req: any, res) => {
    try {
      const v1 = await storage.getCodeHistoryVersion(req.params.projectId, parseInt(req.params.version));
      const v2 = await storage.getCodeHistoryVersion(req.params.projectId, parseInt(req.body.compareVersion));
      res.json({ v1, v2 });
    } catch (error) {
      console.error("Error comparing versions:", error);
      res.status(500).json({ message: "Failed to compare versions" });
    }
  });

  app.patch('/api/code-history/:id/star', isAuthenticated, async (req: any, res) => {
    try {
      const starred = await storage.starCodeVersion(req.params.id, req.body.isStarred);
      res.json(starred);
    } catch (error) {
      console.error("Error starring version:", error);
      res.status(500).json({ message: "Failed to star version" });
    }
  });

  // Code Templates endpoints (Improvement #3)
  app.get('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getCodeTemplates(req.user.claims.sub);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const template = await storage.createCodeTemplate({
        userId: req.user.claims.sub,
        name: req.body.name,
        code: req.body.code,
        category: req.body.category,
        description: req.body.description,
      });
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.delete('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCodeTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Plugin Settings endpoints (Improvement #6)
  app.get('/api/plugin-settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getPluginSettings(req.user.claims.sub) || {
        autoInsertCode: false,
        defaultGameWidth: 100,
        defaultGameHeight: 100,
        defaultAssetScale: "1.0",
        enableValidation: true,
        enableRealTimeSync: true,
        theme: "dark",
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch('/api/plugin-settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.upsertPluginSettings({
        userId: req.user.claims.sub,
        ...req.body,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Analytics endpoints (Improvement #10)
  app.post('/api/analytics/track', isAuthenticated, async (req: any, res) => {
    try {
      const analytic = await storage.trackAnalytics({
        userId: req.user.claims.sub,
        featureName: req.body.featureName,
        action: req.body.action,
        gameType: req.body.gameType,
        metadata: req.body.metadata,
      });
      res.status(201).json(analytic);
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(500).json({ message: "Failed to track analytics" });
    }
  });

  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const analytics = await storage.getAnalytics(req.user.claims.sub, days);

      const summary = {
        totalEvents: analytics.length,
        featureUsage: {} as any,
        actionBreakdown: {} as any,
        gameTypeBreakdown: {} as any,
      };

      analytics.forEach(event => {
        summary.featureUsage[event.featureName] = (summary.featureUsage[event.featureName] || 0) + 1;
        summary.actionBreakdown[event.action] = (summary.actionBreakdown[event.action] || 0) + 1;
        if (event.gameType) {
          summary.gameTypeBreakdown[event.gameType] = (summary.gameTypeBreakdown[event.gameType] || 0) + 1;
        }
      });

      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Asset Preview endpoints (Improvement #2)
  app.get('/api/asset-preview/:assetId', async (req, res) => {
    try {
      const preview = await storage.getAssetPreview(req.params.assetId);
      res.json(preview || { message: "Asset preview not cached" });
    } catch (error) {
      console.error("Error fetching asset preview:", error);
      res.status(500).json({ message: "Failed to fetch asset preview" });
    }
  });

  app.post('/api/asset-preview', async (req, res) => {
    try {
      const preview = await storage.cacheAssetPreview({
        assetId: req.body.assetId,
        assetName: req.body.assetName,
        category: req.body.category,
        thumbnailUrl: req.body.thumbnailUrl,
        previewCode: req.body.previewCode,
        metadata: req.body.metadata,
      });
      res.status(201).json(preview);
    } catch (error) {
      console.error("Error caching asset preview:", error);
      res.status(500).json({ message: "Failed to cache asset preview" });
    }
  });

  // Code Validation endpoint (Improvement #5)
  app.post('/api/validate-code', isAuthenticated, async (req: any, res) => {
    try {
      const code = req.body.code || '';
      const errors = [];

      // Basic Lua syntax validation
      const unclosedIfs = (code.match(/\bif\b/g) || []).length - (code.match(/\bend\b/g) || []).length;
      const unclosedFunctions = (code.match(/\bfunction\b/g) || []).length - (code.match(/\bend\b/g) || []).length;

      if (unclosedIfs > 0) errors.push({ type: 'syntax', line: 0, message: 'Unclosed if statements' });
      if (unclosedFunctions > 0) errors.push({ type: 'syntax', line: 0, message: 'Unclosed functions' });
      if (code.includes('local ') && !code.includes('Instance.new')) {
        // Warn if using local variables but no Instance creation
        errors.push({ type: 'warning', line: 0, message: 'Consider if you need instance creation' });
      }

      res.json({ valid: errors.filter(e => e.type === 'error').length === 0, errors });
    } catch (error) {
      console.error("Error validating code:", error);
      res.status(500).json({ message: "Failed to validate code" });
    }
  });

  // Game Preview endpoint (Improvement #7)
  app.post('/api/projects/:projectId/preview', isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Return preview data with placeholder
      res.json({
        projectId: project.id,
        previewUrl: `/preview/${project.id}`,
        status: 'ready',
        gameType: project.projectType,
      });
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).json({ message: "Failed to generate preview" });
    }
  });

  // Batch generation endpoint (Improvement #9)
  app.post('/api/projects/:projectId/batch-generate', isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project || project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const prompts = req.body.prompts || [];
      const results = [];

      for (const prompt of prompts) {
        const { code, commandType } = await generateRobloxCode({
          prompt: prompt.trim(),
          projectType: project.projectType,
        });

        const command = await storage.createCommand({
          projectId: project.id,
          userId: req.user.claims.sub,
          prompt: prompt.trim(),
          generatedCode: code,
          commandType,
          status: 'completed',
        });

        results.push({ prompt, commandId: command.id, code });
      }

      res.status(201).json({ results, totalGenerated: results.length });
    } catch (error) {
      console.error("Error batch generating:", error);
      res.status(500).json({ message: "Failed to batch generate code" });
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
