import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  Mail,
  Key,
  Shield,
  LogOut,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const [copiedUserId, setCopiedUserId] = useState(false);

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={getUserName()}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold" data-testid="text-profile-name">{getUserName()}</h3>
              <p className="text-muted-foreground" data-testid="text-profile-email">{user?.email || "No email"}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">Used to connect the Roblox plugin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono" data-testid="text-settings-user-id">
                  {user?.id?.slice(0, 12)}...
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyUserId}
                  data-testid="button-copy-user-id"
                >
                  {copiedUserId ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">Your account email</p>
                </div>
              </div>
              <span className="text-sm" data-testid="text-settings-email">{user?.email || "Not set"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">Your current plan</p>
                </div>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SiDiscord className="w-5 h-5" />
            Support & Community
          </CardTitle>
          <CardDescription>Get help and connect with other builders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a 
            href="https://discord.gg/rZbtJJ8XYV" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            data-testid="link-discord"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 flex items-center justify-center">
                <SiDiscord className="w-5 h-5 text-[#5865F2]" />
              </div>
              <div>
                <p className="font-medium">Discord Community</p>
                <p className="text-sm text-muted-foreground">Join for support and updates</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <a href="/api/logout">
            <Button variant="destructive" className="gap-2" data-testid="button-logout">
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        © 2025 King_davez - All Rights Reserved
      </p>
    </div>
  );
}
