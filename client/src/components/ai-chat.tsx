import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePluginConnection } from "@/hooks/usePluginConnection";
import { 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  Code2,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";

interface AIChatProps {
  projectId: string;
  projectType: string;
  onCommandGenerated?: () => void;
}

export function AIChat({ projectId, projectType, onCommandGenerated }: AIChatProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isConnected, sendToPlugin } = usePluginConnection(projectId);
  
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string; code?: string }>>(
    [{ id: "1", role: "assistant", content: "Hi! I'm your AI code generator. Describe what you want to build, and I'll generate production-ready Roblox Lua code for you. The plugin is " + (isConnected ? "connected!" : "connecting...") }]
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handlePluginCodeGenerated = (event: CustomEvent) => {
      const { code, commandType, commandId } = event.detail;
      const assistantMsg = {
        id: commandId || Math.random().toString(),
        role: "assistant" as const,
        content: "I've generated your code and sent it to your plugin! Copy it and paste it into Roblox Studio.",
        code
      };
      setMessages(prev => [...prev, assistantMsg]);
    };

    window.addEventListener("plugin:codeGenerated", handlePluginCodeGenerated as EventListener);
    return () => window.removeEventListener("plugin:codeGenerated", handlePluginCodeGenerated as EventListener);
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (promptText: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/generate`, {
        prompt: promptText,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMsg = {
        id: Math.random().toString(),
        role: "assistant" as const,
        content: isConnected 
          ? "I've generated your code and sent it to your plugin! Check your Roblox Studio."
          : "I've generated your code! Copy it and paste it into Roblox Studio.",
        code: data.code
      };
      setMessages(prev => [...prev, assistantMsg]);
      
      // Send to plugin if connected
      if (isConnected && data.code) {
        sendToPlugin({
          type: "generate",
          prompt: data.prompt,
          projectId
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onCommandGenerated?.();
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!prompt.trim()) return;

    // Add user message
    const userMsg = {
      id: Math.random().toString(),
      role: "user" as const,
      content: prompt
    };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");

    // Generate code
    generateMutation.mutate(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border-2 border-primary/20 overflow-hidden flex flex-col h-full bg-gradient-to-b from-card to-muted/20">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-primary/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 font-black">
                AI Code Generator
                <Badge variant="default" className="text-xs font-bold">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                Plugin Connected
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Plugin Offline
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-lg px-6 py-3" : "space-y-3"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">AI</span>
                    </div>
                  )}
                  <p className={msg.role === "user" ? "text-base" : "text-foreground leading-relaxed"}>{msg.content}</p>
                  
                  {msg.code && (
                    <div className="mt-4 space-y-2">
                      <Separator className={msg.role === "user" ? "bg-white/20" : ""} />
                      <div className="bg-background rounded-lg border border-primary/30 overflow-hidden">
                        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-primary/20">
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            <Code2 className="w-3 h-3" />
                            Lua Code
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => copyCode(msg.code!, msg.id)}
                            data-testid={`button-copy-code-${msg.id}`}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="overflow-x-auto p-4 text-xs font-mono text-muted-foreground max-h-48 bg-background">
                          <code>{msg.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {generateMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating code...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <Separator className="my-0" />
        <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-muted/10">
          <Textarea
            ref={textareaRef}
            placeholder={`Describe what you want to build... (e.g., "add a checkpoint system" or "create a racing track")`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-16 resize-none border-2 border-primary/20 focus:border-primary/50"
            data-testid="input-chat-prompt"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={generateMutation.isPending || !prompt.trim()}
              className="flex-1 glow-primary gap-2"
              data-testid="button-send-prompt"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-bold">Ctrl+Enter</kbd> to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
