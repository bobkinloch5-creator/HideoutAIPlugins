import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft,
  Send,
  Copy,
  Check,
  Clock,
  Code2,
  Sparkles,
  Gamepad2,
  Car,
  Building2,
  Loader2,
  History,
  Trash2,
  Download,
  Settings2
} from "lucide-react";
import type { Project, Command } from "@shared/schema";

const projectTypeIcons: Record<string, typeof Gamepad2> = {
  obby: Gamepad2,
  racing: Car,
  tycoon: Building2,
  custom: Sparkles
};

const projectTypeLabels: Record<string, string> = {
  obby: "Obby",
  racing: "Racing",
  tycoon: "Tycoon",
  custom: "Custom"
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  const { data: commands, isLoading: commandsLoading } = useQuery<Command[]>({
    queryKey: ["/api/projects", id, "commands"],
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: async (promptText: string) => {
      const response = await apiRequest("POST", `/api/projects/${id}/generate`, {
        prompt: promptText,
      });
      return response as Command;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "commands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setPrompt("");
      toast({
        title: "Command generated",
        description: "Your command has been generated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation failed",
        description: "Failed to generate command. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate a command.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyCode = (code: string, commandId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(commandId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const Icon = projectTypeIcons[project.projectType] || Sparkles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/projects")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" data-testid="text-project-name">{project.name}</h1>
              <Badge variant="secondary">
                {projectTypeLabels[project.projectType] || "Custom"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" data-testid="button-settings">
            <Settings2 className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - AI Prompt */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Game Builder
              </CardTitle>
              <CardDescription>
                Describe what you want to build and let AI generate the Lua code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="e.g., Create a checkpoint system with 10 stages, each stage should have a spawn point and update the player's leaderstat when touched..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={6}
                  className="resize-none pr-12 font-mono text-sm"
                  data-testid="input-prompt"
                />
                <Button
                  size="icon"
                  className="absolute bottom-3 right-3"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !prompt.trim()}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Cmd/Ctrl + Enter to generate
              </p>
            </CardContent>
          </Card>

          {/* Latest Command Output */}
          {commands && commands.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">Latest Generated Code</CardTitle>
                  <CardDescription>
                    Copy this code to your Roblox Studio plugin
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(commands[0].generatedCode, commands[0].id)}
                  data-testid="button-copy-latest"
                >
                  {copiedId === commands[0].id ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <ScrollArea className="h-64 rounded-lg bg-muted/50 p-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap" data-testid="text-generated-code">
                      {commands[0].generatedCode}
                    </pre>
                  </ScrollArea>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(commands[0].createdAt!).toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {commands[0].commandType || "general"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Command History */}
          {commands && commands.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Command History
                </CardTitle>
                <CardDescription>
                  Previous generated commands for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {commands.slice(1).map((command, index) => (
                    <AccordionItem key={command.id} value={command.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <Code2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{command.prompt.slice(0, 60)}...</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(command.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{command.commandType || "general"}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(command.generatedCode, command.id)}
                            >
                              {copiedId === command.id ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <ScrollArea className="h-40 rounded-lg bg-muted/50 p-3">
                            <pre className="font-mono text-xs whitespace-pre-wrap">
                              {command.generatedCode}
                            </pre>
                          </ScrollArea>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Project Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary" className="capitalize">{project.status}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Commands</span>
                <span className="font-medium">{project.commandCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assets</span>
                <span className="font-medium">{project.assetCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium text-sm">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="font-medium text-sm">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Templates</CardTitle>
              <CardDescription>Common game systems for {projectTypeLabels[project.projectType]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.projectType === "obby" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a checkpoint system that saves player progress and respawns them at the last touched checkpoint")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Checkpoint System
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create kill bricks that reset the player to their last checkpoint when touched")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Kill Bricks
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a leaderstat system that tracks the current stage for each player")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Stage Leaderstats
                  </Button>
                </>
              )}
              {project.projectType === "racing" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a lap counter system that tracks how many laps each player has completed")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Lap Counter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a vehicle spawner system that gives players a car when they click a button")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Vehicle Spawner
                  </Button>
                </>
              )}
              {project.projectType === "tycoon" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a currency system with leaderstats that tracks Cash for each player")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Currency System
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a dropper that spawns money parts every few seconds")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Money Dropper
                  </Button>
                </>
              )}
              {project.projectType === "custom" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a basic datastore system to save and load player data")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    DataStore System
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => setPrompt("Create a simple GUI with a button that gives the player a tool when clicked")}
                  >
                    <Code2 className="w-4 h-4 mr-2" />
                    Tool Giver GUI
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
