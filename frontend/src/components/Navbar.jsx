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
  Shield, 
  Home, 
  Dumbbell, 
  Trophy, 
  Target, 
  User, 
  History,
  Menu,
  LogOut
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/workout", icon: Dumbbell, label: "Workout" },
    { path: "/achievements", icon: Trophy, label: "Achievements" },
    { path: "/quests", icon: Target, label: "Quests" },
    { path: "/history", icon: History, label: "History" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#2a2a3a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <Sword className="w-6 h-6 text-[#ffd700]" />
            <span className="font-cinzel text-[#ffd700] text-lg hidden sm:inline">Training Hero</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "text-[#ffd700] bg-[#ffd700]/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Level Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#ffd700]/10 rounded-full">
              <Shield className="w-4 h-4 text-[#ffd700]" />
              <span className="text-[#ffd700] text-sm font-medium">Lv.{user?.level}</span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                  data-testid="nav-profile-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0a0a0f]" />
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-[#12121a] border-[#2a2a3a]"
              >
                <div className="px-3 py-2">
                  <p className="text-white font-medium">{user?.username}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
                    data-testid="nav-profile-link"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/achievements" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    Achievements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2a2a3a]" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
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
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-[#12121a] border-[#2a2a3a] md:hidden"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link 
                        to={item.path} 
                        className={`flex items-center gap-2 cursor-pointer ${
                          isActive(item.path) ? "text-[#ffd700]" : "text-gray-300"
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
