import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search,
  Copy,
  Check,
  Box,
  Sword,
  Trees,
  Mountain,
  Building,
  Sparkles,
  Zap,
  Users,
  Car,
  Gem
} from "lucide-react";

const assetCategories = [
  { id: "all", label: "All Assets", icon: Box },
  { id: "props", label: "Props", icon: Box },
  { id: "terrain", label: "Terrain", icon: Mountain },
  { id: "buildings", label: "Buildings", icon: Building },
  { id: "nature", label: "Nature", icon: Trees },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "weapons", label: "Weapons", icon: Sword },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "characters", label: "Characters", icon: Users },
];

const assets = [
  { keyword: "tree", name: "Oak Tree", category: "nature", description: "A tall oak tree with green leaves" },
  { keyword: "pine", name: "Pine Tree", category: "nature", description: "Evergreen pine tree" },
  { keyword: "rock", name: "Boulder", category: "terrain", description: "Large stone boulder" },
  { keyword: "grass", name: "Grass Patch", category: "nature", description: "Decorative grass cluster" },
  { keyword: "flower", name: "Flower Bed", category: "nature", description: "Colorful flowers" },
  { keyword: "house", name: "Basic House", category: "buildings", description: "Simple residential house" },
  { keyword: "shop", name: "Shop Building", category: "buildings", description: "Store front building" },
  { keyword: "tower", name: "Watch Tower", category: "buildings", description: "Medieval stone tower" },
  { keyword: "castle", name: "Castle", category: "buildings", description: "Large medieval castle" },
  { keyword: "bridge", name: "Stone Bridge", category: "props", description: "Arched stone bridge" },
  { keyword: "fence", name: "Wooden Fence", category: "props", description: "Basic wooden fence section" },
  { keyword: "lamp", name: "Street Lamp", category: "props", description: "Classic street lamp post" },
  { keyword: "bench", name: "Park Bench", category: "props", description: "Wooden park bench" },
  { keyword: "crate", name: "Wooden Crate", category: "props", description: "Stackable wooden crate" },
  { keyword: "barrel", name: "Barrel", category: "props", description: "Wooden storage barrel" },
  { keyword: "car", name: "Basic Car", category: "vehicles", description: "Simple driveable car" },
  { keyword: "truck", name: "Pickup Truck", category: "vehicles", description: "Medium pickup truck" },
  { keyword: "boat", name: "Speed Boat", category: "vehicles", description: "Fast water vessel" },
  { keyword: "sword", name: "Iron Sword", category: "weapons", description: "Basic melee weapon" },
  { keyword: "bow", name: "Wooden Bow", category: "weapons", description: "Ranged weapon with arrows" },
  { keyword: "shield", name: "Round Shield", category: "weapons", description: "Defensive equipment" },
  { keyword: "spark", name: "Spark Effect", category: "effects", description: "Sparkling particle effect" },
  { keyword: "smoke", name: "Smoke Effect", category: "effects", description: "Smoke particle system" },
  { keyword: "explosion", name: "Explosion", category: "effects", description: "Explosive visual effect" },
  { keyword: "npc", name: "Basic NPC", category: "characters", description: "Non-player character" },
  { keyword: "enemy", name: "Enemy Zombie", category: "characters", description: "Hostile AI character" },
  { keyword: "mountain", name: "Mountain", category: "terrain", description: "Rocky mountain terrain" },
  { keyword: "river", name: "River", category: "terrain", description: "Flowing water river" },
  { keyword: "path", name: "Stone Path", category: "terrain", description: "Walkable stone pathway" },
  { keyword: "coin", name: "Gold Coin", category: "props", description: "Collectible currency item" },
  { keyword: "gem", name: "Crystal Gem", category: "props", description: "Valuable crystal gemstone" },
  { keyword: "chest", name: "Treasure Chest", category: "props", description: "Lootable container" },
];

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.keyword.includes(searchQuery.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "nature": return Trees;
      case "terrain": return Mountain;
      case "buildings": return Building;
      case "props": return Box;
      case "vehicles": return Car;
      case "weapons": return Sword;
      case "effects": return Sparkles;
      case "characters": return Users;
      default: return Box;
    }
  };

  return (
    <div className="space-y-6">
      {/* Fancy Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/20 via-primary/10 to-cyan-500/10 p-8 border border-accent/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2" data-testid="text-assets-title">Asset Library</h1>
          <p className="text-lg text-muted-foreground">Browse and use 200+ keywords to insert assets in your game</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search assets by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-assets"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {assetCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid={`tab-${category.id}`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {filteredAssets.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const Icon = getCategoryIcon(asset.category);
                return (
                  <Card key={asset.keyword} className="hover-elevate transition-all" data-testid={`card-asset-${asset.keyword}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyKeyword(asset.keyword)}
                          data-testid={`button-copy-${asset.keyword}`}
                        >
                          {copiedKeyword === asset.keyword ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <h3 className="font-semibold mb-1">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {asset.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {asset.keyword}
                        </code>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {asset.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No assets found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or category filter
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How to Use Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Use asset keywords in your AI prompts to automatically insert game objects. 
            Simply mention the keyword in your description and the AI will place the 
            corresponding asset in your game.
          </p>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Example prompt:</p>
            <p className="text-sm text-muted-foreground font-mono">
              "Create a forest area with <span className="text-primary">tree</span>, <span className="text-primary">rock</span>, and <span className="text-primary">flower</span> decorations around a <span className="text-primary">path</span>"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
