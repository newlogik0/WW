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
  Shield, 
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
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/achievements", icon: Trophy, label: "Achievements" },
    { path: "/quests", icon: Target, label: "Quests" },
    { path: "/history", icon: History, label: "History" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#030304]/95 backdrop-blur-md border-b border-[#1e1e2e] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <Shield className="w-5 h-5 text-[#8b5cf6]" />
            <span className="font-display font-semibold text-[#8b5cf6] hidden sm:inline">Warrior's Way</span>
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
                      ? "text-[#a78bfa] bg-[#6d28d9]/15"
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
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#6d28d9]/20 rounded-full">
              <span className="text-[#a78bfa] text-xs font-semibold">Lv.{user?.level}</span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-[#a1a1aa] hover:text-white h-8 px-2"
                  data-testid="nav-profile-menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6d28d9] to-[#4c1d95] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[#0c0c12] border-[#1e1e2e]"
              >
                <div className="px-3 py-2">
                  <p className="text-white font-medium text-sm">{user?.username}</p>
                  <p className="text-[#71717a] text-xs truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#1e1e2e]" />
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
                <DropdownMenuSeparator className="bg-[#1e1e2e]" />
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
                className="w-48 bg-[#0c0c12] border-[#1e1e2e] md:hidden"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        to={item.path} 
                        className={`flex items-center gap-2 cursor-pointer text-sm ${
                          isActive(item.path) ? "text-[#a78bfa]" : "text-[#a1a1aa]"
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
