import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sword, 
  Heart, 
  Zap, 
  Trophy, 
  Target, 
  Dumbbell, 
  Timer,
  User,
  History,
  ChevronRight,
  Flame,
  Upload,
  FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [quests, setQuests] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, workoutsRes, questsRes, planRes] = await Promise.all([
        api.get("/workouts/stats"),
        api.get("/workouts?limit=5"),
        api.get("/quests"),
        api.get("/plans/active").catch(() => ({ data: null }))
      ]);
      
      setStats(statsRes.data);
      setRecentWorkouts(workoutsRes.data);
      setQuests(questsRes.data.filter(q => !q.completed).slice(0, 3));
      setActivePlan(planRes.data);
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
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]" data-testid="dashboard-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="card-glass p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a227] flex items-center justify-center">
                <User className="w-10 h-10 text-[#09090b]" />
              </div>
              <div className="absolute -bottom-2 -right-2 level-badge w-8 h-8 text-sm">
                {user?.level}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl font-display font-bold text-white mb-1" data-testid="user-username">
                {user?.username}
              </h1>
              <p className="text-[#a1a1aa] text-sm mb-4">Level {user?.level} Warrior</p>
              
              {/* XP Bar */}
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="flex justify-between text-xs text-[#71717a] mb-1.5">
                  <span>Experience</span>
                  <span data-testid="user-xp">{user?.xp} / {user?.xp_to_next_level} XP</span>
                </div>
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-3">
              <div className="stat-card-strength rounded-xl p-3 text-center min-w-[70px]">
                <Sword className="w-5 h-5 mx-auto mb-1 stat-strength" />
                <p className="text-xs text-[#71717a]">STR</p>
                <p className="text-lg font-bold stat-strength" data-testid="user-strength">{user?.strength}</p>
              </div>
              <div className="stat-card-endurance rounded-xl p-3 text-center min-w-[70px]">
                <Heart className="w-5 h-5 mx-auto mb-1 stat-endurance" />
                <p className="text-xs text-[#71717a]">END</p>
                <p className="text-lg font-bold stat-endurance" data-testid="user-endurance">{user?.endurance}</p>
              </div>
              <div className="stat-card-agility rounded-xl p-3 text-center min-w-[70px]">
                <Zap className="w-5 h-5 mx-auto mb-1 stat-agility" />
                <p className="text-xs text-[#71717a]">AGI</p>
                <p className="text-lg font-bold stat-agility" data-testid="user-agility">{user?.agility}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Plan Banner */}
        {activePlan && (
          <Card className="bg-gradient-to-r from-[#d4af37]/10 to-transparent border-[#d4af37]/30 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <p className="text-sm text-[#d4af37] font-medium">Active Plan</p>
                  <p className="text-white">{activePlan.name} • {activePlan.exercises?.length || 0} exercises</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
                onClick={() => navigate("/plans")}
              >
                Manage
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="weightlifting-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-white">Weightlifting</h3>
                <p className="text-[#71717a] text-sm">Build strength & power</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#ef4444] transition-colors" />
            </div>
          </div>
          
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/cardio")}
            data-testid="cardio-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-[#06b6d4]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-white">Cardio</h3>
                <p className="text-[#71717a] text-sm">Boost endurance & stamina</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#06b6d4] transition-colors" />
            </div>
          </div>
        </div>

        {/* Import Plan Card */}
        <div 
          className="card-elevated p-5 cursor-pointer group mb-6 border-dashed"
          onClick={() => navigate("/plans")}
          data-testid="import-plan-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-semibold text-white">Import Training Plan</h3>
              <p className="text-[#71717a] text-sm">Upload PDF or photo of your workout plan</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#8b5cf6] transition-colors" />
          </div>
        </div>

        {/* Stats & Quests Row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Stats */}
          <Card className="bg-[#1c1c21] border-[#2e2e33]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#d4af37]" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#a1a1aa]">Total Workouts</span>
                <span className="text-[#d4af37] font-semibold" data-testid="total-workouts">{stats?.total_workouts || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#a1a1aa]">Weightlifting</span>
                <span className="text-[#ef4444] font-semibold">{stats?.weightlifting_count || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#a1a1aa]">Cardio</span>
                <span className="text-[#06b6d4] font-semibold">{stats?.cardio_count || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#2e2e33]">
                <span className="text-[#a1a1aa]">Total XP</span>
                <span className="text-[#d4af37] font-semibold">{stats?.total_xp_earned || 0}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Quests */}
          <Card className="bg-[#1c1c21] border-[#2e2e33] lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-display text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#8b5cf6]" />
                Active Quests
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#8b5cf6] hover:text-[#a78bfa] text-xs h-7"
                onClick={() => navigate("/quests")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {quests.length === 0 ? (
                <p className="text-[#71717a] text-center py-4 text-sm">No active quests</p>
              ) : (
                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div key={quest.id} className="p-3 bg-[#18181b] rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">{quest.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6]">
                          +{quest.xp_reward} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 quest-progress">
                          <div 
                            className="quest-progress-fill" 
                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-[#71717a]">{quest.progress}/{quest.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#1c1c21] border-[#2e2e33]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-display text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#d4af37]" />
              Recent Activity
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#d4af37] hover:text-[#f0d77c] text-xs h-7"
              onClick={() => navigate("/history")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <p className="text-[#71717a] text-center py-6 text-sm">No workouts yet. Start your journey!</p>
            ) : (
              <div className="space-y-2">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="p-3 bg-[#18181b] rounded-lg flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      workout.workout_type === 'weightlifting' 
                        ? 'bg-[#ef4444]/15' 
                        : 'bg-[#06b6d4]/15'
                    }`}>
                      {workout.workout_type === 'weightlifting' ? (
                        <Dumbbell className="w-4 h-4 text-[#ef4444]" />
                      ) : (
                        <Flame className="w-4 h-4 text-[#06b6d4]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium capitalize">{workout.workout_type}</p>
                      <p className="text-[#71717a] text-xs">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#d4af37] text-sm font-semibold">+{workout.xp_earned} XP</p>
                      <div className="flex gap-2 text-xs">
                        {workout.stats_gained?.strength > 0 && (
                          <span className="text-[#ef4444]">+{workout.stats_gained.strength}</span>
                        )}
                        {workout.stats_gained?.endurance > 0 && (
                          <span className="text-[#06b6d4]">+{workout.stats_gained.endurance}</span>
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
