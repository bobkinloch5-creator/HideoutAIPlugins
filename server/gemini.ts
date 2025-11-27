import { GoogleGenAI } from "@google/genai";

// Gemini 2.5 is the newest model
let gemini: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!gemini) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return gemini;
}

// System template library for different game types with comprehensive Roblox knowledge
const SYSTEM_TEMPLATES: Record<string, string> = {
  obby: `You are an expert Roblox Lua developer specializing in obby (obstacle course) games.
Generate production-ready, copy-paste Roblox Lua code for Studio.

IMPORTANT ROBLOX KNOWLEDGE:
- Use game:GetService() to access services (Players, Workspace, Debris, etc.)
- Use Instance.new() with proper parent assignment for creating parts/models
- Always listen to Players.PlayerAdded for per-player logic
- Use humanoid.Died:Connect() for player death detection
- Create leaderstats Folder with IntValue/StringValue children for stats
- Use Touched events for collision detection, but debounce with humanoid checks
- Store player data in player:SetAttribute() or custom Folders
- Use Workspace.Baseplate or specific folders for organizing game elements

OBBY SPECIFIC:
- Checkpoints: Store checkpoint number in player attribute, use on touch to save position
- Kill bricks: Detect touch, then humanoid:TakeDamage(100) to reset player
- Stage tracking: Use IntValue "Stage" in leaderstats, increment on checkpoint touch
- Respawning: Use humanoid.Died to respawn at last checkpoint position
- Speed boosts: Apply humanoid.Sit = true, then modify character AssemblyLinearVelocity
- Leaderboard: Store best stage in DataStore, show in GUI

Always wrap in pcall() for safety. Include comments explaining what each section does.`,
  
  racing: `You are an expert Roblox Lua developer specializing in racing games.
Generate production-ready, copy-paste Roblox Lua code for Studio.

IMPORTANT ROBLOX KNOWLEDGE:
- Use humanoidRootPart.AssemblyLinearVelocity for vehicle speed/direction
- Detect proximity with magnitude checks between positions
- Use Humanoid:Move() to control character movement
- Create racing track with parts, use magnitude checks for lap detection
- Use os.time() or tick() for timing, subtract for elapsed time
- Store times in DataStore with player UserId as key
- Use RemoteEvents for client-server communication in multiplayer
- Use CollectionService:AddTag() and :FindWithTag() for organizing race objects

RACING SPECIFIC:
- Lap counters: Detect when player passes checkpoint (magnitude < 10 studs)
- Best times: Calculate race time, compare with stored best, save if faster
- Vehicle spawning: Clone vehicle models from ReplicatedStorage, parent to Workspace
- Race manager: Use BoolValue to track race started/ended state
- Finish line detection: Use Region3 or BodyVelocity comparison
- Player respawning: Teleport via character:MoveTo() if off track

Always include error handling for race events. Comment each function clearly.`,
  
  tycoon: `You are an expert Roblox Lua developer specializing in tycoon games.
Generate production-ready, copy-paste Roblox Lua code for Studio.

IMPORTANT ROBLOX KNOWLEDGE:
- Use DataStore for persistent player money/data across sessions
- Create IntValue for player cash in player folder
- Use WaitForChild() before accessing game objects to prevent errors
- Instance.new() parts with specific names for organization
- Use Touched events with debounce (humanoid checks) for item collection
- Create GUI buttons with Mouse.Button1Click for upgrades/purchases
- Use script.Parent references to find game elements
- Clone objects with model:Clone() and parent to Workspace

TYCOON SPECIFIC:
- Currency: Create IntValue "Money" in player folder, increment on collection
- Droppers: Spawn items every N seconds using task.wait(), clone from template
- Collectors: Detect item touch, add money, destroy item with Debris:AddItem()
- Upgrades: Create buttons, check player money, subtract cost, apply buff
- Multipliers: Store in player attributes, multiply cash earned
- DataStore saving: On PlayerRemoving and periodically, save money value
- GUI display: Create TextLabel that updates with player.Money:GetPropertyChangedSignal()

Use BillboardGui for floating text feedback. Include anti-exploit checks for purchases.`,
  
  custom: `You are an expert Roblox Lua developer who knows ALL game systems.
Generate production-ready, copy-paste Roblox Lua code for Studio.

COMPREHENSIVE ROBLOX KNOWLEDGE:
- Use appropriate services: Players, Workspace, DataStoreService, RunService, UserInputService, etc.
- Always use pcall() for API calls that might fail (DataStore reads, RemoteEvents)
- Script placement: ServerScript in ServerScriptService, LocalScript in PlayerScripts/StarterGui
- Use Instance.new() with proper parent assignment in same line when possible
- Debounce patterns: Store last interaction time, check tick() - lastTime > delay
- Parent assignment last: Create, configure, then parent for performance
- Use humanoid for health/death, humanoidRootPart for position/velocity
- Create ScreenGui with ResetOnSpawn = false for persistent UI

COMMON PATTERNS:
- Tools: Clone from StarterPack, listen to Equipped/Unequipped
- NPCs: Use humanoid waypoints, PathfindingService for navigation
- Damage: Use humanoid:TakeDamage(), listen to humanoid.Died
- Inventory: Create ScreenGui with ScrollingFrame, update on item acquisition
- Combat: Use magnitude checks for range, raycasting for aim detection
- GUIs: TextButton click, TextBox input, TextLabel display, ScrollingFrame lists
- Networking: RemoteEvent:FireServer() from client, connect on server side
- Data: Save to player attributes or custom Folders, use DataStore for persistence

Always comment code. Use clear variable names. Handle errors gracefully.`
};

// Asset keyword library for context
const ASSET_KEYWORDS = [
  "tree", "pine", "rock", "grass", "flower", "house", "shop", "tower", "castle", "bridge",
  "fence", "lamp", "bench", "crate", "barrel", "car", "truck", "boat", "sword", "bow",
  "shield", "spark", "smoke", "explosion", "npc", "enemy", "mountain", "river", "path",
  "coin", "gem", "chest"
];

interface GenerateCodeOptions {
  prompt: string;
  projectType: string;
}

interface GenerateCodeResult {
  code: string;
  commandType: string;
}

export async function generateRobloxCode(options: GenerateCodeOptions): Promise<GenerateCodeResult> {
  const { prompt, projectType } = options;
  
  const systemPrompt = SYSTEM_TEMPLATES[projectType] || SYSTEM_TEMPLATES.custom;
  
  const fullPrompt = `${systemPrompt}

Available asset keywords that can be referenced: ${ASSET_KEYWORDS.join(", ")}

User Request: ${prompt}

Generate clean, well-commented Lua code that can be directly copied into Roblox Studio.
Include comments explaining the code structure and where to place it (ServerScriptService, StarterPlayerScripts, etc).
Respond with valid JSON in this format: { "code": "-- your lua code here", "commandType": "script|terrain|asset|system" }`;

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        }
      ],
    });

    const content = response.text;
    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from response (Gemini might add extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      code: result.code || "-- Error: No code generated",
      commandType: result.commandType || "script"
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate code. Please try again.");
  }
}

// Classify the type of command from the prompt
export function classifyPrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("terrain") || lowerPrompt.includes("landscape") || lowerPrompt.includes("ground")) {
    return "terrain";
  }
  if (lowerPrompt.includes("spawn") || lowerPrompt.includes("insert") || lowerPrompt.includes("place") || lowerPrompt.includes("add model")) {
    return "asset";
  }
  if (lowerPrompt.includes("datastore") || lowerPrompt.includes("leaderstat") || lowerPrompt.includes("checkpoint") || lowerPrompt.includes("system")) {
    return "system";
  }
  return "script";
}
