import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sword, 
  Home, 
  Dumbbell, 
  Trophy, 
  Target, 
  User, 
  History,
  Menu,
  LogOut,
  FileText
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/workout", icon: Dumbbell, label: "Workout" },
    { path: "/plans", icon: FileText, label: "Plans" },
    { path: "/achievements", icon: Trophy, label: "Achievements" },
    { path: "/quests", icon: Target, label: "Quests" },
    { path: "/history", icon: History, label: "History" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#09090b]/95 backdrop-blur-md border-b border-[#2e2e33] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <Sword className="w-5 h-5 text-[#d4af37]" />
            <span className="font-display font-semibold text-[#d4af37] hidden sm:inline">Training Hero</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
                    isActive(item.path)
                      ? "text-[#d4af37] bg-[#d4af37]/10"
                      : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#d4af37]/10 rounded-full">
              <span className="text-[#d4af37] text-xs font-semibold">Lv.{user?.level}</span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-[#a1a1aa] hover:text-white h-8 px-2"
                  data-testid="nav-profile-menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#c9a227] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#09090b]" />
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[#1c1c21] border-[#2e2e33]"
              >
                <div className="px-3 py-2">
                  <p className="text-white font-medium text-sm">{user?.username}</p>
                  <p className="text-[#71717a] text-xs truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#2e2e33]" />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 text-[#a1a1aa] hover:text-white cursor-pointer text-sm"
                    data-testid="nav-profile-link"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/plans" 
                    className="flex items-center gap-2 text-[#a1a1aa] hover:text-white cursor-pointer text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Training Plans
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2e2e33]" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-[#ef4444] hover:text-[#f87171] cursor-pointer text-sm"
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  data-testid="nav-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-[#a1a1aa] h-8 w-8">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[#1c1c21] border-[#2e2e33] md:hidden"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        to={item.path} 
                        className={`flex items-center gap-2 cursor-pointer text-sm ${
                          isActive(item.path) ? "text-[#d4af37]" : "text-[#a1a1aa]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
