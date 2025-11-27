import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import {
    User,
    Mail,
    Calendar,
    LogOut,
    Settings,
    Trophy,
    Code,
    FolderGit2,
    Zap
} from "lucide-react";
import { SiDiscord } from "react-icons/si";

export default function ProfilePage() {
    const { user, logoutMutation } = useAuth();

    // Fetch user stats
    const { data: stats } = useQuery({
        queryKey: ["/api/stats", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/stats/${user?.id}`);
            if (!response.ok) throw new Error("Failed to fetch stats");
            return response.json();
        },
        enabled: !!user?.id,
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    const userInitials = user.username
        ? user.username.substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || "U";

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">Manage your account and view your stats</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account details from Discord</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                                <AvatarImage
                                    src={user.avatarUrl || user.profileImageUrl}
                                    alt={user.username || "User"}
                                />
                                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-xl font-semibold">{user.fullName || user.username || "User"}</h3>
                                    <Badge variant="secondary" className="gap-1">
                                        <SiDiscord className="w-3 h-3" />
                                        Discord
                                    </Badge>
                                </div>
                                {user.username && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        @{user.username}
                                    </p>
                                )}
                                {user.email && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Member since</span>
                                </div>
                                <span className="font-medium">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Account ID</span>
                                </div>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {user.id.substring(0, 8)}...
                                </code>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <FolderGit2 className="w-4 h-4 text-blue-500" />
                                    <span>Projects</span>
                                </div>
                                <span className="font-semibold">{stats?.totalProjects || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Code className="w-4 h-4 text-green-500" />
                                    <span>Commands</span>
                                </div>
                                <span className="font-semibold">{stats?.totalCommands || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span>Active Projects</span>
                                </div>
                                <span className="font-semibold">{stats?.activeProjects || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Trophy className="w-4 h-4 text-purple-500" />
                                    <span>Assets</span>
                                </div>
                                <span className="font-semibold">{stats?.totalAssets || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="default" className="w-full justify-center py-2">
                                ✓ Active
                            </Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Additional Info */}
            <Card>
                <CardHeader>
                    <CardTitle>About Your Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        Your account is linked with Discord OAuth. You can access all features of Hideout Bot
                        including AI-powered game generation, project management, and the Roblox Studio plugin.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/settings">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/projects">
                                <FolderGit2 className="w-4 h-4 mr-2" />
                                My Projects
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
