import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  MessageCircle, BarChart3, Calendar, Search, LogOut, Sun, Moon, Menu, X,
  Trophy, Star, Target, Lock, Bell, FolderOpen, Lightbulb, Flame
} from "lucide-react";
import { useState } from "react";
import ProfileSettings from "@/components/ProfileSettings";
import { ScrollArea as ScrollAreaUI } from "@/components/ui/scroll-area";

const links = [
  { to: "/", icon: MessageCircle, label: "Journal" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/collections", icon: FolderOpen, label: "Collections" },
  { to: "/prompts", icon: Lightbulb, label: "Prompts" },
  { to: "/challenges", icon: Target, label: "Challenges" },
  { to: "/progress", icon: Flame, label: "Progress" },
  { to: "/achievements", icon: Trophy, label: "Achievements" },
  { to: "/favorites", icon: Star, label: "Favorites" },
  { to: "/vault", icon: Lock, label: "Vault" },
  { to: "/reminders", icon: Bell, label: "Reminders" },
  { to: "/search", icon: Search, label: "Search" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card">
        <div className="p-4 pb-2">
          <h1 className="text-xl font-display font-bold text-foreground px-2">
            🪞 MoodMirror
          </h1>
        </div>
        <ScrollAreaUI className="flex-1 px-4">
          <nav className="space-y-0.5 py-2">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </ScrollAreaUI>
        <div className="space-y-2 p-4 border-t border-border">
          <div className="flex items-center gap-2 px-2 mb-1">
            <span className="text-2xl">{profile?.avatar_emoji || "😊"}</span>
            <div className="min-w-0">
              {profile?.display_name && (
                <p className="text-sm font-medium text-foreground truncate">{profile.display_name}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <ProfileSettings />
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-foreground">🪞 MoodMirror</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-card border-b border-border p-4 space-y-0.5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-3 border-t border-border mt-3">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 md:mt-0 mt-14">
        {children}
      </main>
    </div>
  );
}
