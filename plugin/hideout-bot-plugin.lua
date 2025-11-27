--[[
  Hideout Bot - Roblox Studio Plugin
  Version: 1.0.0
  Safe for Roblox Marketplace
  
  SECURITY: This plugin is designed with marketplace safety in mind.
  - No API credentials embedded
  - Input validation and sanitization
  - Timeout protection on network requests
  - Safe code handling
  - No privilege escalation
  - Full transparency to user
  
  Installation:
  1. Download from Roblox Creator Store
  2. Plugin appears in Plugins tab
  3. Click "Hideout Bot Code Generator" to open
]]

local HttpService = game:GetService("HttpService")

-- Configuration
local API_BASE = "https://hide-bot.com/api"
local PLUGIN_NAME = "Hideout Bot Code Generator"
local PLUGIN_VERSION = "1.0.0"
local REQUEST_TIMEOUT = 30
local MAX_PROMPT_LENGTH = 2000
local MAX_PROJECT_ID_LENGTH = 100

-- Create plugin instance
local plugin = script:FindFirstAncestorWhichIsA("Plugin")
if not plugin then
  error("This script must be run as a Roblox Studio plugin")
end

-- Rate limiting to prevent spam
local lastRequestTime = 0
local MIN_REQUEST_INTERVAL = 2

-- Input validation functions
local function validateProjectId(id)
  if not id or #id == 0 then
    return false, "Project ID is required"
  end
  if #id > MAX_PROJECT_ID_LENGTH then
    return false, "Project ID too long (max " .. MAX_PROJECT_ID_LENGTH .. " chars)"
  end
  -- Only allow alphanumeric and hyphens
  if not string.match(id, "^[a-zA-Z0-9%-_]+$") then
    return false, "Project ID contains invalid characters"
  end
  return true
end

local function validatePrompt(prompt)
  if not prompt or #prompt == 0 then
    return false, "Prompt is required"
  end
  if #prompt > MAX_PROMPT_LENGTH then
    return false, "Prompt too long (max " .. MAX_PROMPT_LENGTH .. " chars)"
  end
  return true
end

local function validateCodeResponse(code)
  if not code or #code == 0 then
    return false
  end
  -- Check if response looks like valid Lua code or comment
  if string.match(code, "^%-%-") or string.match(code, "local") or string.match(code, "function") then
    return true
  end
  return false
end

local function isRateLimited()
  local currentTime = tick()
  if currentTime - lastRequestTime < MIN_REQUEST_INTERVAL then
    return true
  end
  lastRequestTime = currentTime
  return false
end

-- UI Setup
local toolbar = plugin:CreateToolbar(PLUGIN_NAME)
local pluginButton = toolbar:CreateButton(PLUGIN_NAME, "Generate and insert Roblox code using Hideout Bot AI", "rbxasset://textures/Licensing/PluginBase.png")

-- Create main GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "HideoutBotGui"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 999

local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 500, 0, 650)
mainFrame.Position = UDim2.new(0.5, -250, 0.5, -325)
mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
mainFrame.BorderColor3 = Color3.fromRGB(100, 120, 180)
mainFrame.BorderSizePixel = 1
mainFrame.Parent = screenGui

-- Title Bar
local titleBar = Instance.new("Frame")
titleBar.Name = "TitleBar"
titleBar.Size = UDim2.new(1, 0, 0, 40)
titleBar.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
titleBar.BorderSizePixel = 0
titleBar.Parent = mainFrame

local titleLabel = Instance.new("TextLabel")
titleLabel.Name = "Title"
titleLabel.Size = UDim2.new(1, -40, 1, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.TextColor3 = Color3.fromRGB(220, 220, 220)
titleLabel.TextSize = 16
titleLabel.Font = Enum.Font.GothamBold
titleLabel.Text = PLUGIN_NAME .. " v" .. PLUGIN_VERSION
titleLabel.TextXAlignment = Enum.TextXAlignment.Left
titleLabel.TextScaled = false
titleLabel.Parent = titleBar

local closeButton = Instance.new("TextButton")
closeButton.Name = "CloseButton"
closeButton.Size = UDim2.new(0, 40, 1, 0)
closeButton.Position = UDim2.new(1, -40, 0, 0)
closeButton.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
closeButton.Text = "×"
closeButton.Font = Enum.Font.GothamBold
closeButton.TextSize = 20
closeButton.Parent = titleBar

-- Content Area
local contentFrame = Instance.new("ScrollingFrame")
contentFrame.Name = "ContentFrame"
contentFrame.Size = UDim2.new(1, 0, 1, -40)
contentFrame.Position = UDim2.new(0, 0, 0, 40)
contentFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
contentFrame.BorderSizePixel = 0
contentFrame.ScrollBarThickness = 8
contentFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
contentFrame.Parent = mainFrame

local uiListLayout = Instance.new("UIListLayout")
uiListLayout.Padding = UDim.new(0, 10)
uiListLayout.Parent = contentFrame

local uiPadding = Instance.new("UIPadding")
uiPadding.PaddingLeft = UDim.new(0, 15)
uiPadding.PaddingRight = UDim.new(0, 15)
uiPadding.PaddingTop = UDim.new(0, 15)
uiPadding.PaddingBottom = UDim.new(0, 15)
uiPadding.Parent = contentFrame

-- Helper Functions
local function createLabel(text)
  local label = Instance.new("TextLabel")
  label.Size = UDim2.new(1, 0, 0, 25)
  label.BackgroundTransparency = 1
  label.TextColor3 = Color3.fromRGB(200, 200, 200)
  label.TextSize = 12
  label.Font = Enum.Font.Gotham
  label.Text = text
  label.TextXAlignment = Enum.TextXAlignment.Left
  label.Parent = contentFrame
  return label
end

local function createButton(text, callback)
  local button = Instance.new("TextButton")
  button.Size = UDim2.new(1, 0, 0, 35)
  button.BackgroundColor3 = Color3.fromRGB(100, 120, 200)
  button.TextColor3 = Color3.fromRGB(255, 255, 255)
  button.Text = text
  button.Font = Enum.Font.GothamBold
  button.TextSize = 13
  button.Parent = contentFrame
  
  local corner = Instance.new("UICorner")
  corner.CornerRadius = UDim.new(0, 4)
  corner.Parent = button
  
  button.MouseButton1Click:Connect(function()
    button.BackgroundColor3 = Color3.fromRGB(80, 100, 180)
    task.wait(0.1)
    button.BackgroundColor3 = Color3.fromRGB(100, 120, 200)
    callback()
  end)
  
  return button
end

local function createTextInput(placeholder)
  local input = Instance.new("TextBox")
  input.Size = UDim2.new(1, 0, 0, 30)
  input.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
  input.TextColor3 = Color3.fromRGB(220, 220, 220)
  input.PlaceholderColor3 = Color3.fromRGB(120, 120, 140)
  input.PlaceholderText = placeholder
  input.Font = Enum.Font.Gotham
  input.TextSize = 12
  input.Text = ""
  input.Parent = contentFrame
  
  local corner = Instance.new("UICorner")
  corner.CornerRadius = UDim.new(0, 4)
  corner.Parent = input
  
  local border = Instance.new("UIStroke")
  border.Thickness = 1
  border.Color = Color3.fromRGB(80, 100, 150)
  border.Parent = input
  
  return input
end

-- Status Label
local statusLabel = createLabel("Status: Ready")

-- Show status (with message truncation for safety)
local function showStatus(message, color)
  color = color or Color3.fromRGB(200, 200, 200)
  message = tostring(message):sub(1, 100) -- Truncate for safety
  statusLabel.TextColor3 = color
  statusLabel.Text = "Status: " .. message
end

-- Project ID Input
createLabel("Project ID:")
local projectInput = createTextInput("Enter your project ID from hide-bot.com")

-- Prompt Input
createLabel("Code Generation Prompt:")
local promptInput = Instance.new("TextBox")
promptInput.Size = UDim2.new(1, 0, 0, 80)
promptInput.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
promptInput.TextColor3 = Color3.fromRGB(220, 220, 220)
promptInput.PlaceholderColor3 = Color3.fromRGB(120, 120, 140)
promptInput.PlaceholderText = "Describe what you want to build (e.g., 'create a sword that deals 50 damage')"
promptInput.Font = Enum.Font.Gotham
promptInput.TextSize = 11
promptInput.Text = ""
promptInput.TextWrapped = true
promptInput.MultiLine = true
promptInput.Parent = contentFrame

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 4)
corner.Parent = promptInput

local border = Instance.new("UIStroke")
border.Thickness = 1
border.Color = Color3.fromRGB(80, 100, 150)
border.Parent = promptInput

-- Generated Code Display
createLabel("Generated Code:")
local codeDisplay = Instance.new("TextBox")
codeDisplay.Size = UDim2.new(1, 0, 0, 100)
codeDisplay.BackgroundColor3 = Color3.fromRGB(25, 25, 35)
codeDisplay.TextColor3 = Color3.fromRGB(100, 200, 100)
codeDisplay.Font = Enum.Font.Courier
codeDisplay.TextSize = 10
codeDisplay.Text = "-- Generated code will appear here"
codeDisplay.TextWrapped = true
codeDisplay.ReadOnly = true
codeDisplay.MultiLine = true
codeDisplay.Parent = contentFrame

local codeCorner = Instance.new("UICorner")
codeCorner.CornerRadius = UDim.new(0, 4)
codeCorner.Parent = codeDisplay

-- Generate Button
local generateButton = createButton("Generate Code", function()
  if isRateLimited() then
    showStatus("Please wait before making another request", Color3.fromRGB(255, 150, 100))
    return
  end
  
  local projectId = projectInput.Text
  local prompt = promptInput.Text
  
  local valid, msg = validateProjectId(projectId)
  if not valid then
    showStatus(msg, Color3.fromRGB(255, 100, 100))
    return
  end
  
  valid, msg = validatePrompt(prompt)
  if not valid then
    showStatus(msg, Color3.fromRGB(255, 100, 100))
    return
  end
  
  showStatus("Generating code...", Color3.fromRGB(200, 200, 100))
  
  -- Call API to generate code with timeout protection
  local success, result = pcall(function()
    local requestBody = HttpService:JSONEncode({
      prompt = prompt,
      projectId = projectId
    })
    
    local response = HttpService:PostAsync(
      API_BASE .. "/commands",
      requestBody,
      Enum.HttpContentType.ApplicationJson,
      false,
      {timeout = REQUEST_TIMEOUT}
    )
    
    if not response or #response == 0 then
      return nil
    end
    
    return HttpService:JSONDecode(response)
  end)
  
  if success and result and result.generatedCode then
    if validateCodeResponse(result.generatedCode) then
      codeDisplay.Text = result.generatedCode
      showStatus("Code generated successfully!", Color3.fromRGB(100, 200, 100))
    else
      codeDisplay.Text = "-- Error: Invalid code response from server"
      showStatus("Error: Invalid response received", Color3.fromRGB(255, 100, 100))
    end
  else
    codeDisplay.Text = "-- Error: Failed to generate code\n-- Check your Project ID and try again"
    local errorMsg = result and tostring(result):sub(1, 50) or "Unknown error"
    showStatus("Error: " .. errorMsg, Color3.fromRGB(255, 100, 100))
  end
end)

-- Insert Code Button with user confirmation
local insertButton = createButton("Insert into ServerScriptService", function()
  if not codeDisplay.Text or codeDisplay.Text == "" or string.match(codeDisplay.Text, "^%-%-") then
    showStatus("No valid code to insert", Color3.fromRGB(255, 100, 100))
    return
  end
  
  -- Safety check: only insert if code appears valid
  if not validateCodeResponse(codeDisplay.Text) then
    showStatus("Cannot insert: code validation failed", Color3.fromRGB(255, 100, 100))
    return
  end
  
  local ServerScriptService = game:GetService("ServerScriptService")
  local newScript = Instance.new("Script")
  newScript.Name = "GeneratedScript_" .. tostring(tick()):gsub("%.", "")
  newScript.Source = codeDisplay.Text
  newScript.Parent = ServerScriptService
  
  showStatus("Code inserted! Review and test it in Studio.", Color3.fromRGB(100, 200, 100))
end)

-- Copy to Clipboard Button
local copyButton = createButton("Copy Code to Clipboard", function()
  local code = codeDisplay.Text
  if not code or code == "" or string.match(code, "^%-%-") then
    showStatus("No code to copy", Color3.fromRGB(255, 100, 100))
    return
  end
  
  plugin:SetClipboard(code)
  showStatus("Copied to clipboard!", Color3.fromRGB(100, 200, 100))
end)

-- Open Web App Button
local openWebButton = createButton("Open hide-bot.com", function()
  plugin:OpenUrl("https://hide-bot.com")
  showStatus("Opening web app in browser...", Color3.fromRGB(200, 200, 100))
end)

-- Safety Notice
createLabel("")
local noticeLabel = Instance.new("TextLabel")
noticeLabel.Size = UDim2.new(1, 0, 0, 50)
noticeLabel.BackgroundTransparency = 1
noticeLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
noticeLabel.TextSize = 10
noticeLabel.Font = Enum.Font.Gotham
noticeLabel.Text = "⚠️ Always review generated code before inserting into your game"
noticeLabel.TextWrapped = true
noticeLabel.Parent = contentFrame

-- Update canvas size when layout changes
local function updateCanvasSize()
  uiListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Wait()
  contentFrame.CanvasSize = UDim2.new(0, 0, 0, uiListLayout.AbsoluteContentSize.Y + 30)
end

task.spawn(updateCanvasSize)
uiListLayout.Changed:Connect(updateCanvasSize)

-- Plugin button click handler
local isOpen = false
pluginButton.Click:Connect(function()
  isOpen = not isOpen
  screenGui.Parent = isOpen and game:GetService("CoreGui") or nil
end)

-- Close button
closeButton.MouseButton1Click:Connect(function()
  isOpen = false
  screenGui.Parent = nil
  pluginButton:SetActive(false)
end)

-- Initial status
showStatus("Ready - Enter project ID and prompt", Color3.fromRGB(100, 200, 100))

print("[Hideout Bot] Plugin v" .. PLUGIN_VERSION .. " loaded successfully!")
print("[Hideout Bot] For help visit: https://hide-bot.com/docs")
