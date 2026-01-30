import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Sword, 
  Heart, 
  Zap, 
  Trophy, 
  Target, 
  Dumbbell, 
  Timer,
  LogOut,
  User,
  History,
  ChevronRight,
  Flame
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, workoutsRes, questsRes] = await Promise.all([
        api.get("/workouts/stats"),
        api.get("/workouts?limit=5"),
        api.get("/quests")
      ]);
      
      setStats(statsRes.data);
      setRecentWorkouts(workoutsRes.data);
      setQuests(questsRes.data.filter(q => !q.completed).slice(0, 3));
      await refreshUser();
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const xpProgress = user ? (user.xp / user.xp_to_next_level) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="dashboard-page">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-[#12121a] to-[#1a1a25] border-[#ffd700]/30 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar & Level */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center">
                  <User className="w-12 h-12 text-[#0a0a0f]" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#0a0a0f] border-2 border-[#ffd700] flex items-center justify-center">
                  <span className="text-[#ffd700] font-bold" data-testid="user-level">{user?.level}</span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-cinzel text-[#ffd700] mb-2" data-testid="user-username">
                  {user?.username}
                </h1>
                <p className="text-gray-400 mb-4">Level {user?.level} Warrior</p>
                
                {/* XP Bar */}
                <div className="max-w-md mx-auto md:mx-0">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>XP</span>
                    <span data-testid="user-xp">{user?.xp} / {user?.xp_to_next_level}</span>
                  </div>
                  <div className="xp-bar-container">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-lg stat-bg-strength border flex items-center justify-center mb-2">
                    <Sword className="w-7 h-7 stat-strength" />
                  </div>
                  <p className="text-xs text-gray-400">STR</p>
                  <p className="text-lg font-bold stat-strength" data-testid="user-strength">{user?.strength}</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-lg stat-bg-endurance border flex items-center justify-center mb-2">
                    <Heart className="w-7 h-7 stat-endurance" />
                  </div>
                  <p className="text-xs text-gray-400">END</p>
                  <p className="text-lg font-bold stat-endurance" data-testid="user-endurance">{user?.endurance}</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-lg stat-bg-agility border flex items-center justify-center mb-2">
                    <Zap className="w-7 h-7 stat-agility" />
                  </div>
                  <p className="text-xs text-gray-400">AGI</p>
                  <p className="text-lg font-bold stat-agility" data-testid="user-agility">{user?.agility}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="bg-[#12121a] border-[#2a2a3a] hover:border-[#dc2626] transition-all cursor-pointer group"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="weightlifting-card"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#dc2626]/20 flex items-center justify-center group-hover:bg-[#dc2626]/30 transition-colors">
                <Dumbbell className="w-8 h-8 text-[#dc2626]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-cinzel text-white mb-1">Weightlifting</h3>
                <p className="text-gray-400 text-sm">Build strength & power</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-[#dc2626] transition-colors" />
            </CardContent>
          </Card>
          
          <Card 
            className="bg-[#12121a] border-[#2a2a3a] hover:border-[#22d3d3] transition-all cursor-pointer group"
            onClick={() => navigate("/workout/cardio")}
            data-testid="cardio-card"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#22d3d3]/20 flex items-center justify-center group-hover:bg-[#22d3d3]/30 transition-colors">
                <Flame className="w-8 h-8 text-[#22d3d3]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-cinzel text-white mb-1">Cardio</h3>
                <p className="text-gray-400 text-sm">Boost endurance & stamina</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-[#22d3d3] transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Stats & Quests Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Workout Stats */}
          <Card className="bg-[#12121a] border-[#2a2a3a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-cinzel text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-[#ffd700]" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Workouts</span>
                <span className="text-[#ffd700] font-bold" data-testid="total-workouts">{stats?.total_workouts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weightlifting</span>
                <span className="text-[#dc2626] font-bold">{stats?.weightlifting_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cardio</span>
                <span className="text-[#22d3d3] font-bold">{stats?.cardio_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total XP Earned</span>
                <span className="text-[#ffd700] font-bold">{stats?.total_xp_earned || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Quests */}
          <Card className="bg-[#12121a] border-[#2a2a3a] md:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-cinzel text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#a855f7]" />
                Active Quests
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#a855f7] hover:text-[#c084fc]"
                onClick={() => navigate("/quests")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {quests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active quests</p>
              ) : (
                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div key={quest.id} className="p-3 bg-[#1a1a25] rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{quest.name}</span>
                        <span className="text-xs px-2 py-1 rounded bg-[#a855f7]/20 text-[#a855f7]">
                          +{quest.xp_reward} XP
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{quest.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 quest-progress-bar">
                          <div 
                            className="quest-progress-fill" 
                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{quest.progress}/{quest.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#12121a] border-[#2a2a3a]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-cinzel text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#ffd700]" />
              Recent Activity
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#ffd700] hover:text-[#ffed4a]"
              onClick={() => navigate("/history")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No workouts yet. Start your journey!</p>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="p-3 bg-[#1a1a25] rounded-lg flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      workout.workout_type === 'weightlifting' 
                        ? 'bg-[#dc2626]/20' 
                        : 'bg-[#22d3d3]/20'
                    }`}>
                      {workout.workout_type === 'weightlifting' ? (
                        <Dumbbell className="w-5 h-5 text-[#dc2626]" />
                      ) : (
                        <Flame className="w-5 h-5 text-[#22d3d3]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium capitalize">{workout.workout_type}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#ffd700] font-bold">+{workout.xp_earned} XP</p>
                      <div className="flex gap-2 text-xs">
                        {workout.stats_gained?.strength > 0 && (
                          <span className="text-[#dc2626]">+{workout.stats_gained.strength} STR</span>
                        )}
                        {workout.stats_gained?.endurance > 0 && (
                          <span className="text-[#22d3d3]">+{workout.stats_gained.endurance} END</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
