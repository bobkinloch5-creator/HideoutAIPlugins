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

// System template library for different game types
const SYSTEM_TEMPLATES: Record<string, string> = {
  obby: `You are an expert Roblox Lua developer specializing in obby (obstacle course) games. 
Generate production-ready Lua code for Roblox Studio.
Common systems include: checkpoints, kill bricks, stage tracking leaderstats, speed boosts, and respawn mechanics.
Always use best practices: proper error handling, efficient loops, and clear variable names.`,
  
  racing: `You are an expert Roblox Lua developer specializing in racing games.
Generate production-ready Lua code for Roblox Studio.
Common systems include: lap counters, best time tracking, vehicle spawning, race start/finish detection.
Always use best practices: proper error handling, efficient loops, and clear variable names.`,
  
  tycoon: `You are an expert Roblox Lua developer specializing in tycoon games.
Generate production-ready Lua code for Roblox Studio.
Common systems include: currency leaderstats, droppers, collectors, upgrade buttons, data saving.
Always use best practices: proper error handling, efficient loops, and clear variable names.`,
  
  custom: `You are an expert Roblox Lua developer.
Generate production-ready Lua code for Roblox Studio.
You can create any type of game system including: DataStores, GUIs, tools, NPCs, combat systems, inventory systems, and more.
Always use best practices: proper error handling, efficient loops, and clear variable names.`
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
