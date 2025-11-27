import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Gamepad2, 
  Car, 
  Building2, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

const projectTypes = [
  {
    type: "obby",
    title: "Obby Game",
    description: "Create obstacle courses with checkpoints, kill bricks, and leaderboards",
    icon: Gamepad2,
    features: ["Checkpoint system", "Kill bricks", "Stage tracking", "Leaderstats"]
  },
  {
    type: "racing",
    title: "Racing Game",
    description: "Build racing tracks with lap times, vehicle selection, and rankings",
    icon: Car,
    features: ["Lap tracking", "Best times", "Vehicle spawning", "Race management"]
  },
  {
    type: "tycoon",
    title: "Tycoon Game",
    description: "Design business simulations with currency, upgrades, and progression",
    icon: Building2,
    features: ["Currency system", "Droppers & collectors", "Upgrades", "Data saving"]
  },
  {
    type: "custom",
    title: "Custom Project",
    description: "Start with a blank canvas and build anything you can imagine",
    icon: Sparkles,
    features: ["Full flexibility", "AI assistance", "Any game type", "Complete control"]
  }
];

export default function NewProject() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const typeParam = params.get("type");
    if (typeParam && projectTypes.some(t => t.type === typeParam)) {
      setSelectedType(typeParam);
      setStep(2);
    }
  }, [searchParams]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; projectType: string }) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json() as Promise<Project>;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Project created",
        description: `"${project.name}" has been created successfully.`,
      });
      navigate(`/project/${project.id}`);
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
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedType(null);
    }
  };

  const handleCreate = () => {
    if (!projectName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim(),
      projectType: selectedType || "custom",
    });
  };

  const selectedTypeData = projectTypes.find(t => t.type === selectedType);

  return (
    <div className="space-y-8">
      {/* Fancy Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500/20 via-accent/10 to-purple-500/10 p-8 border border-pink-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2" data-testid="text-new-project-title">
            {step === 1 ? "Create New Project" : "Project Details"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {step === 1 
              ? "Choose your game type and start building with AI"
              : `Setting up your new ${selectedTypeData?.title}`
            }
          </p>
        </div>
      </div>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="gap-2"
        onClick={() => step === 1 ? navigate("/") : handleBack()}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {step > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <div className={cn("h-1 flex-1 rounded", step > 1 ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {projectTypes.map((type) => (
            <Card 
              key={type.type}
              className={cn(
                "cursor-pointer transition-all hover-elevate",
                selectedType === type.type && "ring-2 ring-primary"
              )}
              onClick={() => handleTypeSelect(type.type)}
              data-testid={`card-type-${type.type}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <type.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-muted px-2 py-1 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {selectedTypeData && <selectedTypeData.icon className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <CardTitle>{selectedTypeData?.title}</CardTitle>
                <CardDescription>{selectedTypeData?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Game"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your game..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={4}
                data-testid="input-project-description"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back-step">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending || !projectName.trim()}
                data-testid="button-create-project"
              >
                {createMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    Create Project
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
