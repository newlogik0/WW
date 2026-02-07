import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp,
  Zap,
  ChevronRight,
  Calendar,
  Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [workoutsRes, questsRes] = await Promise.all([
        api.get("/workouts?limit=5"),
        api.get("/quests")
      ]);
      setRecentWorkouts(workoutsRes.data);
      setQuests(questsRes.data.filter(q => !q.completed).slice(0, 3));
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const xpProgress = user ? (user.xp / user.xp_to_next_level) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-2 border-[#e5a855] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f14]" data-testid="dashboard-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="welcome-message">
            Welcome back, {user?.username}
          </h1>
          <p className="text-[#a1a1aa]">Let's crush today's goals</p>
        </div>

        {/* Level & XP Card */}
        <Card className="card-elevated mb-8 border-[#e5a855]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#e5a855] to-[#d89644] flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-[#0f0f14]" data-testid="user-level">{user?.level}</span>
                </div>
                <div>
                  <p className="text-xl font-display font-semibold text-white">Level {user?.level}</p>
                  <p className="text-sm text-[#a1a1aa]">Warrior</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold text-[#e5a855]" data-testid="user-xp">
                  {user?.xp}
                </p>
                <p className="text-sm text-[#a1a1aa]">/ {user?.xp_to_next_level} XP</p>
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-center text-xs text-[#71717a] mt-2">
              {user?.xp_to_next_level - user?.xp} XP until next level
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#ef4444]" />
                </div>
                <p className="text-sm text-[#a1a1aa] font-medium">Strength</p>
              </div>
              <p className="text-3xl font-display font-bold stat-strength" data-testid="user-strength">
                {user?.strength}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <p className="text-sm text-[#a1a1aa] font-medium">Endurance</p>
              </div>
              <p className="text-3xl font-display font-bold stat-endurance" data-testid="user-endurance">
                {user?.endurance}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                </div>
                <p className="text-sm text-[#a1a1aa] font-medium">Agility</p>
              </div>
              <p className="text-3xl font-display font-bold stat-agility" data-testid="user-agility">
                {user?.agility}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="weightlifting-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center group-hover:bg-[#ef4444]/20 transition-colors">
                <Dumbbell className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Weightlifting</h3>
                <p className="text-sm text-[#a1a1aa]">Build strength</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </div>
          </div>
          
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/cardio")}
            data-testid="cardio-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center group-hover:bg-[#3b82f6]/20 transition-colors">
                <Flame className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Cardio</h3>
                <p className="text-sm text-[#a1a1aa]">Boost endurance</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </div>
          </div>

          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/calendar")}
            data-testid="calendar-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                <Calendar className="w-6 h-6 text-[#8b5cf6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Calendar</h3>
                <p className="text-sm text-[#a1a1aa]">Track progress</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Quests */}
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#e5a855]" />
                  <h2 className="text-base font-display font-semibold text-white">Active Quests</h2>
                </div>
                <ChevronRight 
                  className="w-5 h-5 text-[#a1a1aa] cursor-pointer hover:text-white transition-colors" 
                  onClick={() => navigate("/quests")}
                />
              </div>
              {quests.length === 0 ? (
                <p className="text-[#71717a] text-sm text-center py-8">Complete workouts to unlock quests</p>
              ) : (
                <div className="space-y-4">
                  {quests.map(quest => {
                    const progress = (quest.progress / quest.target) * 100;
                    return (
                      <div key={quest.id} className="p-4 bg-[#18181f] rounded-lg border border-[#ffffff]/5">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm text-white font-medium">{quest.name}</p>
                          <span className="text-xs px-2 py-1 rounded bg-[#e5a855]/10 text-[#e5a855] font-medium">
                            +{quest.xp_reward} XP
                          </span>
                        </div>
                        <div className="quest-progress-bar mb-2">
                          <div 
                            className="h-full rounded bg-gradient-to-r from-[#e5a855] to-[#f0b968]"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-[#a1a1aa]">{quest.progress} / {quest.target}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#e5a855]" />
                  <h2 className="text-base font-display font-semibold text-white">Recent Activity</h2>
                </div>
                <ChevronRight 
                  className="w-5 h-5 text-[#a1a1aa] cursor-pointer hover:text-white transition-colors" 
                  onClick={() => navigate("/history")}
                />
              </div>
              {recentWorkouts.length === 0 ? (
                <p className="text-[#71717a] text-sm text-center py-8">No workouts yet. Start training!</p>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.map(workout => (
                    <div 
                      key={workout.id} 
                      className="p-4 bg-[#18181f] rounded-lg border border-[#ffffff]/5 hover:border-[#ffffff]/10 transition-colors cursor-pointer" 
                      onClick={() => navigate("/history")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          workout.workout_type === 'weightlifting' 
                            ? 'bg-[#ef4444]/10' 
                            : 'bg-[#3b82f6]/10'
                        }`}>
                          {workout.workout_type === 'weightlifting' ? (
                            <Dumbbell className="w-5 h-5 text-[#ef4444]" />
                          ) : (
                            <Flame className="w-5 h-5 text-[#3b82f6]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium capitalize">{workout.workout_type}</p>
                          <p className="text-xs text-[#a1a1aa]">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#e5a855] font-semibold">+{workout.xp_earned} XP</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
