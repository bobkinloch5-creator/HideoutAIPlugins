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
  Sparkles,
  Download,
  Flame,
  Star,
  Wind
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
      trendUp: true,
      color: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      iconColor: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects ?? 0,
      icon: Zap,
      trend: "+5%",
      trendUp: true,
      color: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20",
      iconColor: "from-yellow-500 to-orange-500"
    },
    {
      title: "Commands Generated",
      value: stats?.totalCommands ?? 0,
      icon: Code2,
      trend: "+28%",
      trendUp: true,
      color: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20",
      iconColor: "from-green-500 to-emerald-500"
    },
    {
      title: "Assets Used",
      value: stats?.totalAssets ?? 0,
      icon: TrendingUp,
      trend: "+15%",
      trendUp: true,
      color: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      iconColor: "from-purple-500 to-pink-500"
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
      {/* Header with Fancy Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-8 border border-primary/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black" data-testid="text-dashboard-title">Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">Welcome back! Build amazing Roblox games with AI.</p>
          </div>
          <Link href="/new-project">
            <Button size="lg" className="gap-2 glow-primary" data-testid="button-new-project">
              <PlusCircle className="w-5 h-5" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className={`group relative hover-elevate border-2 bg-gradient-to-br ${stat.color} ${stat.borderColor} overflow-hidden transition-all duration-300`}
            data-testid={`card-stat-${index}`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.iconColor} opacity-5`} />
            </div>
            <CardHeader className="relative flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 bg-gradient-to-br ${stat.iconColor} rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" data-testid={`text-stat-value-${index}`}>
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="secondary" className={`text-xs font-bold bg-gradient-to-r ${stat.iconColor} bg-opacity-20`}>
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
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/20 overflow-hidden hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 pb-6 border-b border-primary/10">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  Recent Projects
                </CardTitle>
                <CardDescription className="text-sm">Your latest game development projects</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="default" size="sm" className="gap-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all" data-testid="button-view-all-projects">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-6">
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project, idx) => {
                    const Icon = projectTypeIcons[project.projectType] || Sparkles;
                    return (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div 
                          className="flex items-center gap-4 p-5 rounded-2xl border-2 border-primary/10 hover:border-primary/40 bg-gradient-to-r from-card to-muted/20 hover:from-primary/5 hover:to-accent/5 transition-all cursor-pointer group shadow-sm hover:shadow-md transform hover:translate-x-1"
                          style={{ animationDelay: `${idx * 50}ms` }}
                          data-testid={`project-row-${project.id}`}
                        >
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/50 group-hover:to-accent/40 transition-all duration-300 shadow-lg">
                            <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-black truncate text-lg text-foreground">{project.name}</span>
                              <Badge variant="secondary" className="text-xs font-bold">
                                {projectTypeLabels[project.projectType] || "Custom"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Code2 className="w-3.5 h-3.5 text-primary" />
                                {project.commandCount} commands
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "Recently"}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center animate-bounce">
                    <FolderOpen className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-black text-xl mb-3 text-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    Start building amazing Roblox games with AI. Create your first project now!
                  </p>
                  <Link href="/new-project">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all" data-testid="button-create-first-project">
                      <PlusCircle className="w-5 h-5" />
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Start & Downloads */}
        <div className="space-y-6">
          {/* Quick Start */}
          <Card className="border-2 border-primary/20 overflow-hidden hover-elevate transition-all">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 pb-4 border-b border-primary/10">
              <CardTitle className="flex items-center gap-3 font-black text-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Quick Start
              </CardTitle>
              <CardDescription>Choose a game template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {templates.map((template, idx) => (
                <Link key={template.type} href={`/new-project?type=${template.type}`}>
                  <div 
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-primary/10 hover:border-primary/40 bg-gradient-to-r from-muted/30 to-card hover:from-primary/5 hover:to-accent/5 transition-all cursor-pointer group shadow-sm hover:shadow-md transform hover:translate-x-1"
                    style={{ animationDelay: `${idx * 40}ms` }}
                    data-testid={`template-${template.type}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/50 group-hover:to-accent/40 transition-all shadow-md">
                      <template.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold block text-sm text-foreground">{template.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {template.description}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Plugin Download */}
          <Card className="border-2 bg-gradient-to-br from-accent/20 to-primary/20 border-primary/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="font-black">Plugin</CardTitle>
              </div>
              <CardDescription className="font-bold">Get the Roblox Studio plugin</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-current" />
                  <span className="font-medium">v9.0.0 - Latest</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs">100x faster code generation</span>
                </div>
              </div>
              <a href="/api/plugin/download">
                <Button size="sm" className="w-full gap-2 glow-primary" data-testid="button-download-plugin">
                  <Download className="w-4 h-4" />
                  Download Plugin
                </Button>
              </a>
              <Link href="/downloads">
                <Button size="sm" variant="outline" className="w-full gap-2" data-testid="button-plugin-info">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
