import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FolderOpen, Activity } from "lucide-react";

export default function AdminDashboard() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-pulse text-muted-foreground">Loading admin stats...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="p-6 text-destructive">
                        Error loading admin dashboard: {(error as Error).message}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    System overview and management.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            System Status
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.status === "ok" ? "Healthy" : "Issues Detected"}</div>
                        <p className="text-xs text-muted-foreground">
                            Environment: {stats?.env || "Unknown"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Projects
                        </CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Active projects
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Server Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Timestamp</span>
                            <span className="font-mono">{stats?.timestamp}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Database</span>
                            <Badge variant="outline">Connected</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
