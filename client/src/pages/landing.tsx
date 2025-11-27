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
  Users,
  Wand2,
  Flame,
  Star,
  Wind
} from "lucide-react";
import { SiRoblox, SiDiscord } from "react-icons/si";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Game Builder",
      description: "Transform natural language prompts into complete Roblox game systems, scripts, and assets instantly.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Layers,
      title: "200+ Asset Library",
      description: "Access a curated library of game assets, props, and prefabs with keyword-based insertion.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Code2,
      title: "System Templates",
      description: "Production-ready systems for obbies, racing games, tycoons, datastores, and more.",
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Commands sync instantly to your Roblox Studio plugin for seamless game building.",
      color: "from-yellow-500/20 to-orange-500/20"
    },
    {
      icon: Shield,
      title: "Safe & Validated",
      description: "All generated code is validated and safe, following Roblox best practices.",
      color: "from-red-500/20 to-rose-500/20"
    },
    {
      icon: Rocket,
      title: "One-Click Deploy",
      description: "Export your complete game project ready for publishing on Roblox platform.",
      color: "from-indigo-500/20 to-purple-500/20"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Install Plugin",
      description: "Download and install the Hideout Bot plugin in Roblox Studio",
      icon: Download
    },
    {
      number: "02",
      title: "Connect Account",
      description: "Sign in and connect your plugin using your unique User ID",
      icon: Users
    },
    {
      number: "03",
      title: "Describe Your Game",
      description: "Tell the AI what you want to build using natural language",
      icon: Wand2
    },
    {
      number: "04",
      title: "Build & Publish",
      description: "Watch as your game is assembled automatically in Studio",
      icon: Rocket
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-logo">
                Hideout Bot
              </span>
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
              <div className="flex gap-2">
                <a href="/api/discord/login">
                  <Button variant="outline" size="sm" data-testid="button-discord-login">
                    <SiDiscord className="w-4 h-4 mr-2" />
                    Discord
                  </Button>
                </a>
                <a href="/api/login">
                  <Button data-testid="button-login">
                    Sign In
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Cartoon Style */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Cartoon Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Floating Shapes - Cartoon Style */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-30 animate-bounce" style={{ animationDuration: "4s" }} />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg font-bold" data-testid="badge-version">
              <Star className="w-5 h-5 mr-2 fill-current" />
              Version 9.0 - Game Assembler 2.0
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight" data-testid="text-hero-title">
              Build Any{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
                Roblox Game
              </span>
              {" "}with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
              From <span className="text-primary font-semibold">Obbies</span> to <span className="text-accent font-semibold">Racing Games</span>, 
              from <span className="text-purple-400 font-semibold">Tycoons</span> to <span className="text-blue-400 font-semibold">Custom Adventures</span>. 
              The AI-powered platform that makes Roblox game development fast, fun, and accessible to everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a href="/api/login">
                <Button size="lg" className="text-lg px-8 py-6 glow-primary" data-testid="button-get-started">
                  Sign In with Replit
                  <Flame className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="/api/discord/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="button-discord-signup">
                  <SiDiscord className="w-5 h-5 mr-2" />
                  Sign In with Discord
                </Button>
              </a>
            </div>

            {/* Stats Section - Cartoon Style */}
            <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardContent className="p-4">
                  <div className="text-3xl font-black text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Assets</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
                <CardContent className="p-4">
                  <div className="text-3xl font-black text-accent">4 Types</div>
                  <div className="text-sm text-muted-foreground">Game Systems</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                <CardContent className="p-4">
                  <div className="text-3xl font-black text-purple-400">100x</div>
                  <div className="text-sm text-muted-foreground">Faster</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hero Image / Preview - Cartoon Style */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none rounded-3xl" />
            <Card className="border-4 border-primary/30 overflow-hidden shadow-2xl rounded-3xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-background aspect-video flex items-center justify-center relative">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 w-20 h-20 bg-primary/30 rounded-full blur-xl" />
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-accent/30 rounded-full blur-xl" />
                  
                  <div className="text-center p-8 relative z-10">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                        <SiRoblox className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-black text-primary">+</div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center shadow-lg">
                        <Wand2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-black text-accent">=</div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-bounce">
                        <Gamepad2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      Studio Plugin Interface
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Cartoon Grid */}
      <section id="features" className="py-32 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-base font-bold" data-testid="badge-features">
              <Sparkles className="w-4 h-4 mr-2 fill-current" />
              Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black mb-6" data-testid="text-features-title">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make Roblox game development faster and more fun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover-elevate transition-all duration-300 border-2 bg-gradient-to-br ${feature.color} border-primary/20 overflow-hidden`} 
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Cartoon Steps */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-base font-bold" data-testid="badge-how-it-works">
              <Wind className="w-4 h-4 mr-2 fill-current" />
              How It Works
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black mb-6" data-testid="text-how-it-works-title">
              4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From installation to publishing, we've made the process smooth and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%-2rem)] h-1 bg-gradient-to-r from-primary to-accent" />
                )}
                
                <Card className="group hover-elevate relative z-10 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-center mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-center text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold Cartoon Style */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6" data-testid="text-cta-title">
            Ready to Build?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of Roblox developers who are building incredible games with Hideout Bot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api/login">
              <Button size="lg" className="text-lg px-10 py-6 glow-primary" data-testid="button-cta-get-started">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6" data-testid="button-cta-discord">
                <SiDiscord className="w-5 h-5 mr-2" />
                Discord Community
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-black">Hideout Bot</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
              <a href="/downloads" className="hover:text-foreground transition-colors">Downloads</a>
              <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Re-export Download icon from lucide-react
const Download = Zap; // Placeholder, using Zap as it's available
