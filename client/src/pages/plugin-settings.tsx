import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Trash2, Copy, ChevronRight, BarChart3, Zap, Code2, Eye, Package } from "lucide-react";
import { useState } from "react";

export default function PluginSettings() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch plugin settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/plugin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/plugin-settings');
      return res.json();
    },
  });

  // Fetch code history
  const { data: history = [] } = useQuery({
    queryKey: ['/api/code-history'],
    queryFn: async () => {
      // This would need projectId - for now return empty
      return [];
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const res = await fetch('/api/templates');
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analytics = {} } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?days=30');
      return res.json();
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest('PATCH', '/api/plugin-settings', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plugin-settings'] });
      toast({ description: 'Settings updated successfully' });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({ description: 'Template deleted' });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-settings">Plugin Settings & Features</h1>
          <p className="text-muted-foreground">Manage your Hideout Bot plugin configuration and features</p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
            <TabsTrigger value="validation" data-testid="tab-validation">Validation</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="heading-plugin-config">
                <Zap className="w-5 h-5" /> Plugin Configuration
              </h2>
              
              <div className="space-y-6">
                {/* Auto Insert Code */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium" data-testid="label-auto-insert">Auto Insert Code</Label>
                    <p className="text-sm text-muted-foreground">Automatically insert generated code into Studio</p>
                  </div>
                  <Switch
                    data-testid="switch-auto-insert"
                    checked={settings?.autoInsertCode ?? false}
                    onCheckedChange={(checked) => handleSettingChange('autoInsertCode', checked)}
                  />
                </div>

                {/* Real-time Sync */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium" data-testid="label-real-time">Real-time Sync</Label>
                    <p className="text-sm text-muted-foreground">Sync generated code in real-time with dashboard</p>
                  </div>
                  <Switch
                    data-testid="switch-real-time"
                    checked={settings?.enableRealTimeSync ?? true}
                    onCheckedChange={(checked) => handleSettingChange('enableRealTimeSync', checked)}
                  />
                </div>

                {/* Code Validation */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium" data-testid="label-validation">Code Validation</Label>
                    <p className="text-sm text-muted-foreground">Validate code syntax before insertion</p>
                  </div>
                  <Switch
                    data-testid="switch-validation"
                    checked={settings?.enableValidation ?? true}
                    onCheckedChange={(checked) => handleSettingChange('enableValidation', checked)}
                  />
                </div>

                {/* Game Dimensions */}
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="width" className="text-sm" data-testid="label-game-width">Game Width (studs)</Label>
                    <Input
                      id="width"
                      data-testid="input-game-width"
                      type="number"
                      value={settings?.defaultGameWidth ?? 100}
                      onChange={(e) => handleSettingChange('defaultGameWidth', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm" data-testid="label-game-height">Game Height (studs)</Label>
                    <Input
                      id="height"
                      data-testid="input-game-height"
                      type="number"
                      value={settings?.defaultGameHeight ?? 100}
                      onChange={(e) => handleSettingChange('defaultGameHeight', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Asset Scale */}
                <div className="p-4 border rounded-lg">
                  <Label htmlFor="scale" className="text-sm" data-testid="label-asset-scale">Default Asset Scale</Label>
                  <Input
                    id="scale"
                    data-testid="input-asset-scale"
                    type="text"
                    value={settings?.defaultAssetScale ?? "1.0"}
                    onChange={(e) => handleSettingChange('defaultAssetScale', e.target.value)}
                    placeholder="1.0"
                    className="mt-1"
                  />
                </div>

                {/* Theme */}
                <div className="p-4 border rounded-lg">
                  <Label htmlFor="theme" className="text-sm" data-testid="label-theme">Plugin Theme</Label>
                  <select
                    id="theme"
                    data-testid="select-theme"
                    value={settings?.theme ?? "dark"}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Code Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="heading-templates">
                <Code2 className="w-5 h-5" /> Code Templates Library
              </h2>
              
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-templates">No templates saved yet. Save frequently used code snippets as templates for quick reuse.</p>
                ) : (
                  templates.map((template: any) => (
                    <div key={template.id} className="p-4 border rounded-lg hover-elevate" data-testid={`card-template-${template.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium" data-testid={`text-template-name-${template.id}`}>{template.name}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-template-category-${template.id}`}>{template.category}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-delete-template-${template.id}`}
                          onClick={() => deleteTemplateMutation.mutate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`text-template-desc-${template.id}`}>{template.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground" data-testid={`text-template-usage-${template.id}`}>Used {template.usage} times</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Code History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="heading-history">
                <Package className="w-5 h-5" /> Code History & Versions
              </h2>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-history">Generate code to see version history here. Each generation is automatically saved for rollback and comparison.</p>
                ) : (
                  history.map((item: any, idx: number) => (
                    <div key={item.id} className="p-4 border rounded-lg hover-elevate" data-testid={`card-history-${item.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium" data-testid={`text-history-version-${item.id}`}>Version {item.version}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-history-date-${item.id}`}>{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-star-history-${item.id}`}
                        >
                          <Star className="w-4 h-4" fill={item.isStarred ? "currentColor" : "none"} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Code Validation Tab */}
          <TabsContent value="validation" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="heading-validation">
                <Eye className="w-5 h-5" /> Code Validation & Preview
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg" data-testid="box-validation-info">
                  <h3 className="font-medium mb-2" data-testid="text-validation-title">Features:</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li data-testid="text-validation-feature-1">✓ Lua syntax validation - detects unclosed statements</li>
                    <li data-testid="text-validation-feature-2">✓ Asset preview panel - view thumbnails before insertion</li>
                    <li data-testid="text-validation-feature-3">✓ Smart code insertion - auto-detect script locations</li>
                    <li data-testid="text-validation-feature-4">✓ Game preview mode - test code in Studio</li>
                    <li data-testid="text-validation-feature-5">✓ Real-time error detection</li>
                  </ul>
                </div>

                <Button variant="default" className="w-full" data-testid="button-test-validation">
                  Test Code Validation
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" data-testid="heading-analytics">
                <BarChart3 className="w-5 h-5" /> Plugin Analytics
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-muted">
                  <p className="text-sm text-muted-foreground" data-testid="text-analytics-total-label">Total Events</p>
                  <p className="text-2xl font-bold" data-testid="text-analytics-total">{analytics.totalEvents || 0}</p>
                </Card>
                <Card className="p-4 bg-muted">
                  <p className="text-sm text-muted-foreground" data-testid="text-analytics-games-label">Games Generated</p>
                  <p className="text-2xl font-bold" data-testid="text-analytics-games">{Object.keys(analytics.gameTypeBreakdown || {}).length || 0}</p>
                </Card>
              </div>

              <div className="space-y-4">
                {analytics.featureUsage && Object.keys(analytics.featureUsage).length > 0 && (
                  <div data-testid="section-feature-usage">
                    <h3 className="font-medium mb-3" data-testid="text-feature-usage-title">Feature Usage</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.featureUsage).map(([feature, count]: [string, any]) => (
                        <div key={feature} className="flex justify-between items-center p-2 bg-muted rounded" data-testid={`row-feature-${feature}`}>
                          <span className="text-sm" data-testid={`text-feature-name-${feature}`}>{feature}</span>
                          <span className="text-sm font-medium" data-testid={`text-feature-count-${feature}`}>{count} uses</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.gameTypeBreakdown && Object.keys(analytics.gameTypeBreakdown).length > 0 && (
                  <div data-testid="section-game-types">
                    <h3 className="font-medium mb-3" data-testid="text-game-types-title">Game Types</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.gameTypeBreakdown).map(([gameType, count]: [string, any]) => (
                        <div key={gameType} className="flex justify-between items-center p-2 bg-muted rounded" data-testid={`row-gametype-${gameType}`}>
                          <span className="text-sm capitalize" data-testid={`text-gametype-name-${gameType}`}>{gameType}</span>
                          <span className="text-sm font-medium" data-testid={`text-gametype-count-${gameType}`}>{count} projects</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!analytics.featureUsage || Object.keys(analytics.featureUsage).length === 0) && (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-analytics">No analytics data yet. Start using the plugin to see detailed statistics.</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Access Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-batch-generation">
            <h3 className="font-medium mb-2 flex items-center gap-2" data-testid="text-batch-title">
              <Package className="w-4 h-4" /> Batch Generation
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-batch-desc">Generate multiple game elements at once</p>
          </Card>

          <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-smart-insertion">
            <h3 className="font-medium mb-2 flex items-center gap-2" data-testid="text-smart-title">
              <Zap className="w-4 h-4" /> Smart Insertion
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-smart-desc">Auto-detect where to place code</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
