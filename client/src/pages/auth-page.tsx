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
import { SiDiscord } from "react-icons/si";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export default function AuthPage() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    // Force redirect if user is already logged in
    useEffect(() => {
        if (user) {
            console.log("User detected, redirecting to dashboard...");
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

    // Listen for auth state changes
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
                        const userData = await res.json();
                        queryClient.setQueryData(["/api/auth/user"], userData);
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
                        <SiDiscord className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription className="text-base">
                        Sign in to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Logged in as</p>
                                <p className="font-medium flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {user.username || user.email}
                                </p>
                            </div>
                            <Button
                                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                onClick={() => setLocation("/dashboard")}
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            onClick={onDiscordLogin}
                        >
                            <SiDiscord className="mr-2 h-5 w-5" />
                            Continue with Discord
                        </Button>
                    )}

                    <div className="text-center text-xs text-muted-foreground pt-4">
                        By continuing, you agree to our{" "}
                        <a href="/terms" className="underline hover:text-primary transition-colors">Terms</a>
                        {" "}and{" "}
                        <a href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
