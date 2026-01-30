import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  ArrowLeft, 
  Sword,
  Heart,
  Zap,
  Trophy,
  Dumbbell,
  Flame,
  Calendar,
  LogOut
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const xpProgress = user ? (user.xp / user.xp_to_next_level) * 100 : 0;

  // Calculate total stat points
  const totalStats = user ? user.strength + user.endurance + user.agility : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="profile-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-[#12121a] to-[#1a1a25] border-[#ffd700]/30 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center">
                  <User className="w-16 h-16 text-[#0a0a0f]" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[#0a0a0f] border-2 border-[#ffd700] flex items-center justify-center">
                  <span className="text-[#ffd700] font-bold text-xl">{user?.level}</span>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-cinzel text-[#ffd700] mb-2" data-testid="profile-username">
                  {user?.username}
                </h1>
                <p className="text-gray-400 mb-1">{user?.email}</p>
                <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </p>
                
                {/* XP Bar */}
                <div className="max-w-md mx-auto md:mx-0 mt-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Level {user?.level}</span>
                    <span>{user?.xp} / {user?.xp_to_next_level} XP</span>
                  </div>
                  <div className="xp-bar-container h-6">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#12121a] border-[#dc2626]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl stat-bg-strength border flex items-center justify-center">
                  <Sword className="w-7 h-7 stat-strength" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Strength</p>
                  <p className="text-3xl font-bold stat-strength" data-testid="profile-strength">
                    {user?.strength}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Increased by weightlifting
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#12121a] border-[#22d3d3]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl stat-bg-endurance border flex items-center justify-center">
                  <Heart className="w-7 h-7 stat-endurance" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Endurance</p>
                  <p className="text-3xl font-bold stat-endurance" data-testid="profile-endurance">
                    {user?.endurance}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Increased by cardio
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#12121a] border-[#22c55e]/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl stat-bg-agility border flex items-center justify-center">
                  <Zap className="w-7 h-7 stat-agility" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Agility</p>
                  <p className="text-3xl font-bold stat-agility" data-testid="profile-agility">
                    {user?.agility}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Increased by varied training
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="bg-[#12121a] border-[#2a2a3a] mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#ffd700]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#1a1a25] rounded-lg">
                <p className="text-3xl font-bold text-[#ffd700]">{user?.total_workouts}</p>
                <p className="text-gray-400 text-sm">Total Workouts</p>
              </div>
              <div className="text-center p-4 bg-[#1a1a25] rounded-lg">
                <p className="text-3xl font-bold text-[#ffd700]">{user?.level}</p>
                <p className="text-gray-400 text-sm">Level</p>
              </div>
              <div className="text-center p-4 bg-[#1a1a25] rounded-lg">
                <p className="text-3xl font-bold text-[#ffd700]">{totalStats}</p>
                <p className="text-gray-400 text-sm">Total Stats</p>
              </div>
              <div className="text-center p-4 bg-[#1a1a25] rounded-lg">
                <p className="text-3xl font-bold text-[#ffd700]">{user?.xp}</p>
                <p className="text-gray-400 text-sm">Current XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
