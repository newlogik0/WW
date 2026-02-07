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
      <div className="min-h-screen bg-[#0d0d0d]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="dashboard-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-1" data-testid="welcome-message">
            Welcome back, {user?.username}
          </h1>
          <p className="text-[#b3b3b3] text-sm">Let's crush today's goals</p>
        </div>

        {/* Level & XP Card */}
        <Card className="card-elevated mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center border border-[#00d9ff]/20">
                  <span className="text-xl font-bold text-[#00d9ff]" data-testid="user-level">{user?.level}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Level {user?.level}</p>
                  <p className="text-sm text-[#b3b3b3]">Warrior</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#00d9ff]" data-testid="user-xp">
                  {user?.xp}
                </p>
                <p className="text-sm text-[#b3b3b3]">/ {user?.xp_to_next_level} XP</p>
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-center text-xs text-[#808080] mt-2">
              {user?.xp_to_next_level - user?.xp} XP until next level
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#ff4444]" />
                <p className="text-xs text-[#b3b3b3] font-medium">Strength</p>
              </div>
              <p className="text-2xl font-bold stat-strength" data-testid="user-strength">
                {user?.strength}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#4d94ff]" />
                <p className="text-xs text-[#b3b3b3] font-medium">Endurance</p>
              </div>
              <p className="text-2xl font-bold stat-endurance" data-testid="user-endurance">
                {user?.endurance}
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                <p className="text-xs text-[#b3b3b3] font-medium">Agility</p>
              </div>
              <p className="text-2xl font-bold stat-agility" data-testid="user-agility">
                {user?.agility}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div 
            className="card-elevated p-4 cursor-pointer group"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="weightlifting-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff4444]/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#ff4444]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Weightlifting</h3>
                <p className="text-xs text-[#b3b3b3]">Build strength</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#808080]" />
            </div>
          </div>
          
          <div 
            className="card-elevated p-4 cursor-pointer group"
            onClick={() => navigate("/workout/cardio")}
            data-testid="cardio-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4d94ff]/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#4d94ff]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Cardio</h3>
                <p className="text-xs text-[#b3b3b3]">Boost endurance</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#808080]" />
            </div>
          </div>

          <div 
            className="card-elevated p-4 cursor-pointer group"
            onClick={() => navigate("/calendar")}
            data-testid="calendar-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00d9ff]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#00d9ff]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Calendar</h3>
                <p className="text-xs text-[#b3b3b3]">Track progress</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#808080]" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Active Quests */}
          <Card className="card-elevated">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#00d9ff]" />
                  <h2 className="text-sm font-semibold text-white">Active Quests</h2>
                </div>
                <ChevronRight 
                  className="w-4 h-4 text-[#b3b3b3] cursor-pointer hover:text-white transition-colors" 
                  onClick={() => navigate("/quests")}
                />
              </div>
              {quests.length === 0 ? (
                <p className="text-[#808080] text-sm text-center py-6">Complete workouts to unlock quests</p>
              ) : (
                <div className="space-y-3">
                  {quests.map(quest => {
                    const progress = (quest.progress / quest.target) * 100;
                    return (
                      <div key={quest.id} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-white font-medium">{quest.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#00d9ff]/10 text-[#00d9ff] font-medium">
                            +{quest.xp_reward}
                          </span>
                        </div>
                        <div className="quest-progress-bar mb-1">
                          <div 
                            className="h-full rounded bg-[#00d9ff]"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-[#b3b3b3]">{quest.progress} / {quest.target}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-elevated">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#00d9ff]" />
                  <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
                </div>
                <ChevronRight 
                  className="w-4 h-4 text-[#b3b3b3] cursor-pointer hover:text-white transition-colors" 
                  onClick={() => navigate("/history")}
                />
              </div>
              {recentWorkouts.length === 0 ? (
                <p className="text-[#808080] text-sm text-center py-6">No workouts yet. Start training!</p>
              ) : (
                <div className="space-y-2">
                  {recentWorkouts.map(workout => (
                    <div 
                      key={workout.id} 
                      className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333333] hover:border-[#00d9ff]/30 transition-colors cursor-pointer" 
                      onClick={() => navigate("/history")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          workout.workout_type === 'weightlifting' 
                            ? 'bg-[#ff4444]/10' 
                            : 'bg-[#4d94ff]/10'
                        }`}>
                          {workout.workout_type === 'weightlifting' ? (
                            <Dumbbell className="w-4 h-4 text-[#ff4444]" />
                          ) : (
                            <Flame className="w-4 h-4 text-[#4d94ff]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium capitalize">{workout.workout_type}</p>
                          <p className="text-xs text-[#b3b3b3]">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#00d9ff] font-semibold">+{workout.xp_earned}</p>
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
