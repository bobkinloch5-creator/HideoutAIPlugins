--[[
  Hideout Bot - Roblox Studio Plugin
  Integrates with https://hide-bot.com to generate and insert Roblox code
  
  Installation:
  1. Copy this file to: C:\Users\[Your Username]\AppData\Local\Roblox\Plugins\
  2. Restart Roblox Studio
  3. Plugin appears in Plugins tab
]]

local HttpService = game:GetService("HttpService")
local StudioService = game:GetService("StudioService")

-- Configuration
local API_BASE = "https://hide-bot.com/api"
local PLUGIN_NAME = "Hideout Bot Code Generator"
local PLUGIN_VERSION = "1.0.0"

-- Create plugin instance
local plugin = script:FindFirstAncestorWhichIsA("Plugin")
if not plugin then
  error("This script must be run as a Roblox Studio plugin")
end

-- UI Setup
local toolbar = plugin:CreateToolbar(PLUGIN_NAME)
local pluginButton = toolbar:CreateButton(PLUGIN_NAME, "Generate and insert Roblox code", "rbxasset://textures/Licensing/PluginBase.png")

-- Create main GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "HideoutBotGui"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 999

local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 500, 0, 600)
mainFrame.Position = UDim2.new(0.5, -250, 0.5, -300)
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

-- Show status
local function showStatus(message, color)
  color = color or Color3.fromRGB(200, 200, 200)
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
  local projectId = projectInput.Text
  local prompt = promptInput.Text
  
  if not projectId or projectId == "" then
    showStatus("Enter project ID", Color3.fromRGB(255, 100, 100))
    return
  end
  
  if not prompt or prompt == "" then
    showStatus("Enter a prompt", Color3.fromRGB(255, 100, 100))
    return
  end
  
  showStatus("Generating...", Color3.fromRGB(200, 200, 100))
  
  -- Call API to generate code
  local success, result = pcall(function()
    local requestBody = HttpService:JSONEncode({
      prompt = prompt,
      projectId = projectId
    })
    
    local response = HttpService:PostAsync(
      API_BASE .. "/commands",
      requestBody,
      Enum.HttpContentType.ApplicationJson,
      false
    )
    
    return HttpService:JSONDecode(response)
  end)
  
  if success and result then
    codeDisplay.Text = result.generatedCode or "-- No code generated"
    showStatus("Code generated successfully!", Color3.fromRGB(100, 200, 100))
  else
    codeDisplay.Text = "-- Error generating code. Check project ID and try again."
    showStatus("Error: " .. (result or "Unknown error"), Color3.fromRGB(255, 100, 100))
  end
end)

-- Insert Code Button
local insertButton = createButton("Insert into ServerScriptService", function()
  if codeDisplay.Text == "" or string.match(codeDisplay.Text, "^%-%-") then
    showStatus("No code to insert", Color3.fromRGB(255, 100, 100))
    return
  end
  
  local ServerScriptService = game:GetService("ServerScriptService")
  local newScript = Instance.new("Script")
  newScript.Name = "GeneratedScript_" .. tostring(tick()):gsub("%.", "")
  newScript.Source = codeDisplay.Text
  newScript.Parent = ServerScriptService
  
  showStatus("Code inserted into ServerScriptService!", Color3.fromRGB(100, 200, 100))
end)

-- Copy to Clipboard Button
local copyButton = createButton("Copy Code", function()
  local code = codeDisplay.Text
  if code == "" then
    showStatus("No code to copy", Color3.fromRGB(255, 100, 100))
    return
  end
  
  plugin:SetClipboard(code)
  showStatus("Copied to clipboard!", Color3.fromRGB(100, 200, 100))
end)

-- Open Web App Button
local openWebButton = createButton("Open hide-bot.com", function()
  plugin:OpenUrl("https://hide-bot.com")
  showStatus("Opening web app...", Color3.fromRGB(200, 200, 100))
end)

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

print("Hideout Bot Plugin loaded successfully!")
