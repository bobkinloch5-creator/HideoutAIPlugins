import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Zap, Shield, TrendingUp } from "lucide-react";

export default function Downloads() {
  const currentVersion = "9.0.0";
  const releaseDate = "November 27, 2025";

  const versions = [
    {
      version: "9.0.0",
      date: "November 27, 2025",
      status: "latest",
      features: [
        "Real-time WebSocket sync with dashboard",
        "Advanced AI prompt processing",
        "Toolbox asset insertion",
        "Anti-exploit security",
        "Performance optimization for large games",
      ],
      improvements: [
        "100x faster code generation",
        "Multi-currency economy system",
        "Prestige & progression systems",
        "Complete combat framework",
        "NPC AI pathfinding",
      ],
    },
    {
      version: "8.5.2",
      date: "November 20, 2025",
      status: "stable",
      features: [
        "Obby, Racing, Tycoon, Custom game types",
        "Gemini 2.5 AI integration",
        "Project management",
        "Basic command history",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section - Fancy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/20 via-primary/10 to-cyan-500/10 p-8 border border-green-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2" data-testid="text-downloads-title">Plugin Downloads</h1>
          <p className="text-lg text-muted-foreground" data-testid="text-downloads-subtitle">Download the Hideout Bot Roblox Studio plugin to start building games with AI.</p>
          <p className="text-sm text-muted-foreground" data-testid="text-latest-version">
            Latest version: <span className="font-semibold">{currentVersion}</span>
          </p>
        </div>
      </div>

      {/* Download Section */}
      <div>
        {/* Latest Version */}
        <Card className="mb-8 overflow-hidden border-primary/50 bg-primary/5" data-testid="card-latest-version">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">v{currentVersion}</h2>
                  <Badge variant="default" data-testid="badge-latest">
                    Latest Release
                  </Badge>
                </div>
                <p className="text-muted-foreground" data-testid="text-release-date">
                  Released {releaseDate}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">100x Faster</p>
                  <p className="text-sm text-muted-foreground">Real-time code generation</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Enterprise-Grade</p>
                  <p className="text-sm text-muted-foreground">Anti-exploit & security</p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">AI-Powered</p>
                  <p className="text-sm text-muted-foreground">Gemini 2.5 integration</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4" data-testid="text-whats-new">What's New</h3>
              <ul className="space-y-2 text-sm">
                {versions[0].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4" data-testid="text-improvements">Major Improvements</h3>
              <ul className="space-y-2 text-sm">
                {versions[0]?.improvements?.map((improvement: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/api/plugin/download">
                <Button size="lg" className="gap-2" data-testid="button-download-plugin">
                  <Download className="w-5 h-5" />
                  Download Plugin
                </Button>
              </a>
              <a href="https://github.com/hideout-bot/plugin/releases" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-github-releases">
                  <ExternalLink className="w-5 h-5" />
                  GitHub Releases
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Installation Guide */}
        <Card className="mb-8" data-testid="card-installation">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6" data-testid="text-installation-title">Installation Guide</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1">Download the Plugin</p>
                  <p className="text-sm text-muted-foreground">Click the download button above to get the latest .rbxm file</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1">Open Roblox Studio</p>
                  <p className="text-sm text-muted-foreground">Launch Studio and open your game project</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1">Import Plugin</p>
                  <p className="text-sm text-muted-foreground">
                    Go to <code className="bg-muted px-2 py-1 rounded text-xs">Plugins → Manage Plugins</code> and select the downloaded file
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <p className="font-semibold mb-1">Sign In</p>
                  <p className="text-sm text-muted-foreground">Use your account on hideout-bot.com to authenticate the plugin</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                  5
                </div>
                <div>
                  <p className="font-semibold mb-1">Start Building</p>
                  <p className="text-sm text-muted-foreground">Open the Hideout Bot panel and connect to your project to start generating code</p>
                </div>
              </li>
            </ol>
          </div>
        </Card>

        {/* Version History */}
        <div data-testid="section-version-history">
          <h2 className="text-2xl font-bold mb-6" data-testid="text-version-history">Version History</h2>
          <div className="space-y-4">
            {versions.map((v) => (
              <Card key={v.version} data-testid={`card-version-${v.version}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">v{v.version}</h3>
                        <Badge variant={v.status === "latest" ? "default" : "secondary"}>
                          {v.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{v.date}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {v.features.map((feature, i) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
