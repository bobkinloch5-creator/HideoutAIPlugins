import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiRoblox, SiDiscord } from "react-icons/si";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

const authSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email address").optional(),
});

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const loginForm = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const registerForm = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            password: "",
            email: "",
        },
    });

    const onLogin = (data: z.infer<typeof authSchema>) => {
        loginMutation.mutate(data, {
            onSuccess: () => setLocation("/")
        });
    };

    const onRegister = (data: z.infer<typeof authSchema>) => {
        if (!data.email) {
            registerForm.setError("email", { message: "Email is required for registration" });
            return;
        }
        // Auto-generate username from email if not provided
        const username = data.email.split('@')[0];
        registerMutation.mutate({ ...data, username } as any, {
            onSuccess: () => setLocation("/")
        });
    };

    const onDemoLogin = () => {
        loginMutation.mutate({ username: "test_user", password: "password123" }, {
            onSuccess: () => setLocation("/")
        });
    };

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
                        // Update query cache to reflect logged in state
                        queryClient.setQueryData(["/api/user"], user);
                        setLocation("/");
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
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue building
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username or Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter your username or email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Enter your password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register">
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">

                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="Enter your email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="Choose a password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={registerMutation.isPending}
                                        >
                                            {registerMutation.isPending ? "Creating account..." : "Create Account"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onDemoLogin}
                                disabled={loginMutation.isPending}
                            >
                                Demo Login
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onDiscordLogin}
                                disabled={loginMutation.isPending}
                            >
                                <SiDiscord className="mr-2 h-4 w-4" />
                                Discord
                            </Button>
                        </div>
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
