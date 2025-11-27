import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiRoblox, SiDiscord } from "react-icons/si";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export default function AuthPage() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/dashboard");
        }
    }, [user, setLocation]);

    const onDiscordLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            console.error("Discord login error:", error);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (event === 'SIGNED_IN' && session?.user) {
                // Sync with backend
                try {
                    const res = await fetch("/api/login/external", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || "discord_user",
                            email: session.user.email,
                            externalId: session.user.id
                        }),
                    });

                    if (res.ok) {
                        const user = await res.json();
                        queryClient.setQueryData(["/api/auth/user"], user);
                        setLocation("/dashboard");
                    }
                } catch (err) {
                    console.error("Backend sync failed:", err);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [setLocation]);

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="flex items-center justify-center p-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <SiRoblox className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold">Hideout Bot</h1>
                        </div>
                        <CardTitle className="text-2xl">Welcome</CardTitle>
                        <CardDescription>
                            Sign in with Discord to continue building
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="default"
                            size="lg"
                            className="w-full"
                            onClick={onDiscordLogin}
                        >
                            <SiDiscord className="mr-2 h-5 w-5" />
                            Continue with Discord
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full"
                            disabled
                        >
                            <SiRoblox className="mr-2 h-5 w-5" />
                            Roblox Login (Coming Soon)
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted text-muted-foreground">
                <div className="max-w-md mx-auto space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">
                        Build Roblox Games with AI
                    </h2>
                    <p className="text-lg">
                        Generate assets, scripts, and entire game systems using natural language prompts.
                        The fastest way to build on Roblox.
                    </p>
                </div>
            </div>
        </div>
    );
}
