import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  PlusCircle, 
  Zap, 
  Code2, 
  TrendingUp,
  Clock,
  ArrowRight,
  Gamepad2,
  Car,
  Building2,
  Sparkles
} from "lucide-react";
import type { Project } from "@shared/schema";

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

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProjects: number;
    activeProjects: number;
    totalCommands: number;
    totalAssets: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects ?? 0,
      icon: Zap,
      trend: "+5%",
      trendUp: true
    },
    {
      title: "Commands Generated",
      value: stats?.totalCommands ?? 0,
      icon: Code2,
      trend: "+28%",
      trendUp: true
    },
    {
      title: "Assets Used",
      value: stats?.totalAssets ?? 0,
      icon: TrendingUp,
      trend: "+15%",
      trendUp: true
    }
  ];

  const templates = [
    {
      type: "obby",
      title: "Obby Game",
      description: "Obstacle course with checkpoints, kill bricks, and leaderboard",
      icon: Gamepad2
    },
    {
      type: "racing",
      title: "Racing Game",
      description: "Track-based racing with lap times and vehicle selection",
      icon: Car
    },
    {
      type: "tycoon",
      title: "Tycoon Game",
      description: "Business simulation with currency, upgrades, and buildings",
      icon: Building2
    },
    {
      type: "custom",
      title: "Custom Project",
      description: "Start with a blank canvas and build anything you imagine",
      icon: Sparkles
    }
  ];

  const recentProjects = projects?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your projects.</p>
        </div>
        <Link href="/new-project">
          <Button className="gap-2" data-testid="button-new-project">
            <PlusCircle className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" data-testid={`text-stat-value-${index}`}>
                    {stat.value.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest game development projects</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-projects">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => {
                    const Icon = projectTypeIcons[project.projectType] || Sparkles;
                    return (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div 
                          className="flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer"
                          data-testid={`project-row-${project.id}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{project.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {projectTypeLabels[project.projectType] || "Custom"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Code2 className="w-3 h-3" />
                                {project.commandCount} commands
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "Recently"}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create your first project to get started
                  </p>
                  <Link href="/new-project">
                    <Button data-testid="button-create-first-project">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Choose a template to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template, index) => (
                <Link key={template.type} href={`/new-project?type=${template.type}`}>
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer"
                    data-testid={`template-${template.type}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <template.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block">{template.title}</span>
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
