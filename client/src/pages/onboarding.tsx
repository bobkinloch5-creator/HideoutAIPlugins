import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { 
  Sparkles, 
  Zap, 
  Code2, 
  Gamepad2, 
  ArrowRight,
  CheckCircle2,
  Rocket,
  Settings,
  Library,
  MessageSquare
} from 'lucide-react';

const onboardingSteps = [
  {
    step: 1,
    title: 'Welcome to Hideout Bot',
    subtitle: 'AI-Powered Roblox Game Builder',
    description: 'Build production-ready Roblox games 100x faster with AI. Describe what you want, and we\'ll generate the code.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Generate complete game systems with natural language',
      'Access 200+ curated assets and templates',
      'Real-time sync with Roblox Studio plugin'
    ]
  },
  {
    step: 2,
    title: 'Create Your First Project',
    subtitle: 'Choose Your Game Type',
    description: 'Pick from pre-built templates: Obby, Racing, Tycoon, or Custom. Each includes advanced systems and best practices.',
    icon: Gamepad2,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Obby: Checkpoint systems, kill bricks, leaderboards',
      'Racing: Lap tracking, vehicle physics, leaderboards',
      'Tycoon: Currency, droppers, upgrades'
    ]
  },
  {
    step: 3,
    title: 'Use AI to Generate Code',
    subtitle: 'Describe What You Want',
    description: 'Tell our AI exactly what you want to build. The more detailed, the better! The AI will generate production-ready Lua code with detailed explanations.',
    icon: Code2,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Get detailed breakdowns of what the code does',
      'Learn best practices and advanced patterns',
      'Copy-paste ready code for Roblox Studio'
    ]
  },
  {
    step: 4,
    title: 'Connect Your Plugin',
    subtitle: 'Real-Time Sync',
    description: 'Download our Roblox Studio plugin and connect it using your User ID for instant code sync and seamless development.',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    features: [
      'Copy your User ID from Settings',
      'Download plugin from Downloads page',
      'Paste code directly into Studio'
    ]
  },
  {
    step: 5,
    title: 'Explore Asset Library',
    subtitle: '200+ Game Assets',
    description: 'Browse our curated library of assets. Use keywords in your prompts to automatically include them in generated code.',
    icon: Library,
    color: 'from-indigo-500 to-purple-500',
    features: [
      'Props, terrain, buildings, vehicles, weapons',
      'Effects, NPCs, and character models',
      'Keyword-based insertion for easy use'
    ]
  },
  {
    step: 6,
    title: 'Start Building!',
    subtitle: 'You\'re Ready to Go',
    description: 'You now have everything you need to create amazing Roblox games. Head to your dashboard and start your first project!',
    icon: Rocket,
    color: 'from-red-500 to-pink-500',
    features: [
      'Visit Dashboard to see your projects',
      'Create a new project and start prompting',
      'Join our Discord for support: discord.gg/rZbtJJ8XYV'
    ]
  }
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);

  const step = onboardingSteps[currentStep - 1];
  const progress = (currentStep / onboardingSteps.length) * 100;
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigate('/');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="default" className="text-sm font-bold">
              Step {currentStep} of {onboardingSteps.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-card to-muted/10 hover-elevate transition-all">
          {/* Gradient Background */}
          <div className={`h-32 bg-gradient-to-r ${step.color} opacity-90 relative overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-foreground">{step.title}</h2>
              <p className="text-lg font-semibold text-primary">{step.subtitle}</p>
              <p className="text-foreground/80 text-lg leading-relaxed">{step.description}</p>
            </div>

            {/* Features */}
            <div className="space-y-3 bg-muted/30 rounded-xl p-6 border border-primary/10">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Key Points</p>
              {step.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground/90">{feature}</p>
                </div>
              ))}
            </div>

            {/* Visual Indicator */}
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: onboardingSteps.length }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent"
              >
                {currentStep === onboardingSteps.length ? 'Start Building' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}
