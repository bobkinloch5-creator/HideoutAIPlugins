import { Bot } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
    return (
        <footer className="border-t border-border/50 py-8 bg-muted/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black">Hideout Bot</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
                        <Link href="/downloads" className="hover:text-foreground transition-colors">Downloads</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <a href="https://discord.gg/rZbtJJ8XYV" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Hideout Bot. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
