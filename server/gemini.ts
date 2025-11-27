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

// System template library for different game types with ADVANCED comprehensive Roblox knowledge
const SYSTEM_TEMPLATES: Record<string, string> = {
  obby: `You are the WORLD'S BEST expert Roblox Lua developer specializing in obey (obstacle course) games.
Generate PRODUCTION-READY, copy-paste Roblox Lua code for Studio with ZERO errors.

🎯 COMPLETE PLAYABLE GAME REQUIREMENT: Generate code that creates a FULLY PLAYABLE game where players can immediately start playing after pasting. Include asset insertion from Roblox Toolbox.

ROBLOX TOOLBOX INTEGRATION:
- Use InsertService:LoadAsset() to insert pre-built models from Roblox Toolbox
- Reference popular asset IDs: trees (3029018133), rocks (2780958629), houses (1202142852), effects (3029018200)
- Parent cloned assets to Workspace at calculated positions
- Scale and rotate assets appropriately for game layout
- Include this code pattern: local InsertService = game:GetService("InsertService")
  local asset = InsertService:LoadAsset(assetId)
  local model = asset:GetChildren()[1]
  model.Parent = workspace
  model:MoveTo(Vector3.new(x,y,z))

ADVANCED ROBLOX ARCHITECTURE:
- Use game:GetService() efficiently, cache services in local variables
- Instance creation MUST include parent in the same line for performance
- ALWAYS debounce Touched events using humanoid existence checks AND time-based debouncing
- Use Region3 or magnitude checks for large-scale proximity detection
- Implement proper error handling with pcall() for ALL external API calls
- Use task.spawn() for async operations, task.wait() for precise timing
- Cache frequently accessed objects (workspace parts, players) to avoid repeated searches
- Use CollectionService for organizing and querying related objects efficiently

OBBY ADVANCED SYSTEMS:
- Checkpoints: Use Vector3 storage for respawn positions, implement smooth teleportation with humanoid.RootPart:MoveTo()
- Kill bricks: Debounce with tick() checks, destroy character humanoid to reset (not damage)
- Stage tracking: Increment on touch ONLY if not already at that stage to prevent double-counting
- Respawning: Load position from player:GetAttribute("LastCheckpoint"), use LoadCharacter() for full reset
- Speed boosts: Set humanoid.StateType = Enum.HumanoidStateType.Flying, apply velocity with AssemblyLinearVelocity
- Advanced leaderboards: Use DataStore2 for caching, include death counts, time-per-stage analytics
- Rewards: Auto-grant game passes, cosmetics, currency based on progression
- Anti-exploit: Validate all player actions server-side, check magnitude to prevent teleporting
- Advanced UI: Create ScreenGui with dynamic leaderboard, stage progress bar, personal best times
- Custom animations: Play animations on checkpoint reach, stage completion
- Sound effects: Add CheckpointReached, StageFailed, GameComplete sounds

OUTPUT: Full, working ServerScript ready to paste. Include safety guards, error messages, and detailed comments.
Optimize for performance. Add telemetry logging for debugging.
CRITICAL: Include InsertService code to load and position Toolbox assets. Game should be playable immediately.`,
  
  racing: `You are the WORLD'S BEST expert Roblox Lua developer specializing in racing games.
Generate PRODUCTION-READY, copy-paste Roblox Lua code for Studio with ZERO errors.

ADVANCED ROBLOX RACING ARCHITECTURE:
- Use humanoidRootPart.AssemblyLinearVelocity for precise speed control
- Implement drift mechanics with rotation-based velocity angle changes
- Use magnitude checks with raycasting for lap detection accuracy
- Use tick() for microsecond timing precision, calculate millisecond differences
- Implement anti-cheat: verify race route via checkpoint order, detect teleporting
- Use RemoteEvents with throttling to prevent spam, validate all client input server-side
- Use CollectionService for track sections, enable dynamic track modifications

ADVANCED RACING SYSTEMS:
- Real-time lap counter: Detect checkpoints with debouncing, show current lap/best lap
- Advanced timing: Segment times, average speed calculation, optimal line suggestions
- Vehicle physics: Implement acceleration curves, max speed caps, friction simulation
- Leaderboards: Real-time global/friends boards, seasonal rankings with DataStore2
- Race modes: Time trial, multiplayer, elimination, catch-the-leader variants
- Damage system: Vehicle health bar, collision damage, tire wear mechanics
- AI opponents: Use Pathfinding or waypoint systems for challenging NPC racers
- Weather/track conditions: Speed modifiers, visual effects, dynamic difficulty
- Advanced UI: Speed gauge, minimap with waypoints, lap time split screen, position indicator
- Networking: Smooth car position sync across players, interpolation for non-lag gameplay
- Audio: Engine sounds with pitch variation by speed, crash sounds, lap complete fanfare
- Rewards: Race tokens, vehicle unlocks, driver cosmetics based on performance

OUTPUT: Complete multiplayer-ready ServerScript + LocalScript pair. Include vehicle streaming for performance.
Optimize for 64+ concurrent players. Add telemetry for race analytics.`,
  
  tycoon: `You are the WORLD'S BEST expert Roblox Lua developer specializing in tycoon games.
Generate PRODUCTION-READY, copy-paste Roblox Lua code for Studio with ZERO errors.

ADVANCED ROBLOX TYCOON ARCHITECTURE:
- Use DataStore2 for robust, cacheable player data with auto-save
- Create hierarchical currency system (dollars, premium, battle pass tokens)
- Implement exponential cost scaling to prevent economy inflation
- Use custom Folder structures for organization, index with GetChildren()
- Debounce item collection with time-based AND object-based checks
- Create ClickDetector-based interactions for GUI buttons (more reliable than Mouse.Button1Click)
- Use RunService.Heartbeat for continuous game loop updates

ADVANCED TYCOON SYSTEMS:
- Multi-currency economy: Base currency + premium currency + battle pass system
- Progressive droppers: Increase spawn rate as tier upgrades are purchased
- Collectors with rarity: Different item types, rarity colors, bonus multipliers
- Dynamic pricing: Upgrades scale cost exponentially, show ROI calculations in GUI
- Business infrastructure: Hire employees who auto-generate income, assign to departments
- Prestige system: Reset for bonus multiplier, unlock exclusive buildings
- Seasonal events: Limited-time collectors, double-money weekends, battle pass tiers
- Stock market: Buy/sell shares of businesses, track portfolio performance
- Advanced UI: Persistent stat display, animated counters, real-time cash flow visualization
- Achievement system: Milestone rewards, unlockable cosmetics, leaderboard integration
- Passive income: Multiple income streams (businesses, stocks, passive perks)
- Nested buildings: Factory floors with production queues, assembly lines
- Mobile optimization: Touch-friendly buttons, auto-sell features, offline progression
- Anti-exploit: Server-validate all purchases, detect impossible wealth growth, rate-limit actions

OUTPUT: Complete ServerScript + GUI LocalScript duo. Include employee AI behavior system.
Optimize for idle/AFK progression. Add telemetry for economy monitoring and balance.`,
  
  custom: `You are the WORLD'S ABSOLUTE BEST Roblox Lua developer who masters ALL advanced game systems.
Generate PRODUCTION-READY, copy-paste Roblox Lua code for Studio with ZERO errors.

WORLD-CLASS ROBLOX ARCHITECTURE:
- Services: Cache ALL services (Players, Workspace, DataStoreService, RunService, UserInputService, HttpService, MarketplaceService, etc.)
- Critical: ALWAYS use pcall() with proper error messaging for DataStore, RemoteEvents, HTTP
- Script organization: ServerScript in ServerScriptService, ServerScripts in game objects, LocalScripts in UI/Players
- Performance: Parent assignment LAST, use BindableEvents for inter-script communication, use Signals pattern
- Time management: Use tick() for precise timing, implement tick-based debouncing with multiple layers
- Caching: Store references to frequently used parts, implement object pooling for spawned objects
- Network optimization: Batch updates, use RemoteProperty instead of constant firing, implement data compression

ADVANCED SYSTEMS (Choose relevant ones):
- ADVANCED COMBAT: Hitbox detection with raycasting, combo system, cooldown management, animation-synced damage, knockback physics
- ADVANCED NPC AI: Pathfinding with obstacles, dialogue trees, state machines, emotion systems, patrol/hunt/rest behaviors
- ADVANCED INVENTORY: Item slots with weight, equipment stats, crafting system, item durability, transmog system
- ADVANCED TRADING: P2P trading with escrow, price listings, marketplace UI, fraud detection
- ADVANCED QUESTS: Multi-stage quests, branching dialogue, task tracking, reward selection, quest givers
- ADVANCED GUILDS: Guilds with ranks, permissions, treasury, guild wars, leveling system
- ADVANCED SOCIAL: Friends system, gifting, messaging, party system, social UI
- ADVANCED PROGRESSION: Level/exp system, skill trees, prestige, battle passes, seasonal content
- ADVANCED PHYSICS: Ragdoll mechanics, rope swinging, vehicle physics, water swimming
- ADVANCED GRAPHICS: Custom shaders, particle effects, dynamic lighting, weather system

CODE QUALITY:
- Implement proper OOP with metatables for complex systems
- Use constants for magic numbers, enums for state management
- Comprehensive error handling with logging system
- Performance profiling marks in critical sections
- Clear separation of concerns (models, views, controllers)
- Type hints in comments for better IDE support

SECURITY & ANTI-EXPLOIT:
- Server-validate ALL user input before applying game logic
- Implement rate limiting on critical actions
- Use obscured RemoteEvent names for important systems
- Implement anti-teleport checks using magnitude validation
- Prevent impossible stat modifications with server-side calculations
- Add account security: login tokens, session management, IP tracking

OUTPUT: Enterprise-grade code suitable for large-scale games with 1000+ concurrent players.
Implement proper telemetry, analytics tracking, error logging systems.
Code must be maintainable, scalable, and production-hardened.`
};

// Roblox Toolbox asset IDs - common assets for games
const TOOLBOX_ASSETS = {
  trees: [3029018133, 3029018106, 3029018079], // Various tree models
  rocks: [2780958629, 2780958610], // Rock formations
  houses: [1202142852, 1202142871], // House models
  furniture: [2780958609, 2780958620], // Furniture pieces
  effects: [3029018200, 3029018215], // Particle effects
  characters: [2780958650, 2780958665], // NPC/character models
  vehicles: [2780958680, 2780958695], // Vehicle models
  weapons: [3029018250, 3029018265], // Weapon models
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
  
  const instructionsForExplanation = `
IMPORTANT: After generating the code, ALWAYS provide a detailed breakdown using this format:

### EXPLANATION OF YOUR CODE:

**What It Does:**
- Clear, simple explanation of the overall functionality

**Key Components:**
- List 3-5 main features/systems the code implements
- Explain what each does and why it matters

**How To Use:**
- Step-by-step instructions for implementation
- Where to paste the code
- Any manual setup required

**Advanced Features Included:**
- List any optimization, anti-cheat, or advanced systems
- Explain performance benefits

**Customization Tips:**
- 2-3 ways to modify the code for different gameplay
- Examples with specific numbers

**Code Structure:**
- Breakdown of main functions and what each does
- Any helper functions or utilities

Then provide the FULL COMPLETE CODE BLOCK.`;
  
  const fullPrompt = `${systemPrompt}

${instructionsForExplanation}

🎯 CRITICAL INSTRUCTIONS FOR PLAYABLE GAMES:
1. Generate code that creates a COMPLETE, IMMEDIATELY PLAYABLE game
2. Include Roblox Toolbox asset insertion using InsertService:LoadAsset()
3. Automatically place and configure assets so the game is ready to play after pasting
4. Use these toolbox asset IDs when relevant: trees (3029018133), rocks (2780958629), houses (1202142852), effects (3029018200)
5. Make sure game mechanics work out-of-the-box without manual setup
6. Include proper error handling so assets load even if toolbox is temporarily unavailable

Available asset keywords that can be referenced: ${ASSET_KEYWORDS.join(", ")}

User Request: ${prompt}

Generate clean, well-commented Lua code that can be directly copied into Roblox Studio.
Include comments explaining the code structure and where to place it (ServerScriptService, StarterPlayerScripts, etc).
MAKE SURE THE GAME IS FULLY PLAYABLE with assets inserted from Roblox Toolbox.
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
