import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/footer";

import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import NewProject from "@/pages/new-project";
import ProjectDetail from "@/pages/project-detail";
import Assets from "@/pages/assets";
import Docs from "@/pages/docs";
import Settings from "@/pages/settings";
import PluginSettings from "@/pages/plugin-settings";
import Downloads from "@/pages/downloads";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import ProfilePage from "@/pages/profile";


function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };
  const { user } = useAuth();

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              {user && (
                <Link href="/profile">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={user.avatarUrl || user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`}
                      alt={user.username || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                    />
                    <span className="text-sm font-medium hidden sm:inline">{user.username || user.email}</span>
                  </div>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/projects" component={Projects} />
        <Route path="/new-project" component={NewProject} />
        <Route path="/project/:id" component={ProjectDetail} />
        <Route path="/assets" component={Assets} />
        <Route path="/docs" component={Docs} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/settings" component={Settings} />
        <Route path="/plugin-settings" component={PluginSettings} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="hideout-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
