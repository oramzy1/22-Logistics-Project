import { Bell, Menu, Search, ChevronDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { CommandSearch } from "@/components/dashboard/CommandSearch";

interface TopnavProps {
  onMenuClick: () => void;
  unreadCount?: number;
  onNotifClick: () => void;
}

export function Topnav({ onMenuClick, unreadCount = 0, onNotifClick }: TopnavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'AD';

useEffect(() => {
  const h = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
  };
  window.addEventListener("keydown", h);
  return () => window.removeEventListener("keydown", h);
}, []);


  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-topnav text-topnav-foreground border-b border-border flex items-center px-4 lg:px-6 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-md"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm">
          <Avatar className="h-7 w-7">
            <AvatarImage src="https://i.pravatar.cc/40?img=12" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user?.name ?? 'Admin'}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {theme === "dark" ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : theme === "light" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Monitor className="mr-2 h-4 w-4" />
              )}
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 max-w-md mx-auto hidden md:block">
  <button
    onClick={() => setSearchOpen(true)}
    className="w-full h-9 px-3 rounded-full bg-surface border border-border text-sm text-muted-foreground flex items-center gap-2 hover:border-accent/50 transition-colors"
  >
    <Search className="h-4 w-4 shrink-0" />
    <span className="flex-1 text-left">Search…</span>
    <kbd className="hidden lg:inline-flex items-center border border-border/70 rounded px-1.5 py-0.5 text-[10px] font-mono gap-0.5">⌘K</kbd>
  </button>
</div>

      <div className="flex items-center gap-2 ml-auto">
       <button
    onClick={onNotifClick}
    className="relative p-2 rounded-full hover:bg-muted"
    aria-label="Notifications"
  >
    <Bell className="h-5 w-5" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 h-4 w-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-medium">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex sm:hidden items-center gap-1 p-1 rounded-md hover:bg-muted">
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://i.pravatar.cc/40?img=12" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.name ?? 'Admin'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}