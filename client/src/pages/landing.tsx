import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Sparkles, 
  Zap, 
  Layers, 
  Code2, 
  Rocket, 
  Shield,
  ArrowRight,
  Play,
  CheckCircle2,
  Bot,
  Gamepad2,
  Users
} from "lucide-react";
import { SiRoblox, SiDiscord } from "react-icons/si";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Game Builder",
      description: "Transform natural language prompts into complete Roblox game systems, scripts, and assets instantly."
    },
    {
      icon: Layers,
      title: "200+ Asset Library",
      description: "Access a curated library of game assets, props, and prefabs with keyword-based insertion."
    },
    {
      icon: Code2,
      title: "System Templates",
      description: "Production-ready systems for obbies, racing games, tycoons, datastores, and more."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Commands sync instantly to your Roblox Studio plugin for seamless game building."
    },
    {
      icon: Shield,
      title: "Safe & Validated",
      description: "All generated code is validated and safe, following Roblox best practices."
    },
    {
      icon: Rocket,
      title: "One-Click Deploy",
      description: "Export your complete game project ready for publishing on Roblox platform."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Install Plugin",
      description: "Download and install the Hideout Bot plugin in Roblox Studio"
    },
    {
      number: "02",
      title: "Connect Account",
      description: "Sign in and connect your plugin using your unique User ID"
    },
    {
      number: "03",
      title: "Describe Your Game",
      description: "Tell the AI what you want to build using natural language"
    },
    {
      number: "04",
      title: "Build & Publish",
      description: "Watch as your game is assembled automatically in Studio"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold" data-testid="text-logo">Hideout Bot</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">How It Works</a>
              <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2" data-testid="link-discord">
                <SiDiscord className="w-4 h-4" />
                Discord
              </a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a href="/api/login">
                <Button data-testid="button-login">
                  Sign In
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2" data-testid="badge-version">
              <Sparkles className="w-4 h-4 mr-2" />
              Version 9.0 - Game Assembler 2.0
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6" data-testid="text-hero-title">
              Build Any{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Roblox Game
              </span>
              {" "}with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Transform natural language prompts into complete game systems, assets, and scripts. 
              The ultimate AI-powered game builder for Roblox Studio.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/api/login">
                <Button size="lg" className="text-lg px-8 py-6 glow-primary" data-testid="button-get-started">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="button-watch-demo">
                  <Play className="w-5 h-5 mr-2" />
                  Join Discord
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Image / Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-card via-card to-muted aspect-video flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <SiRoblox className="w-8 h-8 text-primary" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-accent" />
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Gamepad2 className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Roblox Studio Plugin Interface
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-features">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-features-title">
              Everything You Need to Build
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make game development faster and easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover-elevate transition-all duration-300" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-how-it-works">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-how-it-works-title">
              Build Games in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From installation to publishing, we've made the process as smooth as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-50" />
            <Card className="relative border-2 border-primary/20 overflow-hidden">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-title">
                  Ready to Build Your Dream Game?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of creators using Hideout Bot to build amazing Roblox experiences.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/api/login">
                    <Button size="lg" className="text-lg px-8 py-6" data-testid="button-cta-start">
                      Get Started for Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </div>
                <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Free tier available
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Cancel anytime
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Hideout Bot</span>
                <p className="text-sm text-muted-foreground">AI-Powered Game Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-discord">
                <SiDiscord className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © 2025 King_davez - All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
