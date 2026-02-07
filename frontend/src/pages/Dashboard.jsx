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
  Sword,
  Heart,
  ChevronRight,
  Timer,
  Calendar,
  Crown
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#121826] to-[#0a0e1a]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#00d4ff]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#121826] to-[#0a0e1a]" data-testid="dashboard-page">
      <Navbar />
      
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ffd700]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffd700] to-[#ff8800] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}>
              <Crown className="w-7 h-7 text-[#0a0e1a]" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-[#ffd700] via-[#ffe44d] to-[#ffd700] bg-clip-text text-transparent" data-testid="welcome-message">
                Welcome, {user?.username}!
              </h1>
              <p className="text-[#a0aec0] text-sm font-medium tracking-wide">Ready to level up today?</p>
            </div>
          </div>

          {/* Level & XP Card */}
          <Card className="bg-gradient-to-br from-[#1a2332]/90 to-[#121826]/90 border-2 border-[#ffd700]/30 backdrop-blur-sm shadow-2xl" style={{ boxShadow: '0 0 40px rgba(255, 215, 0, 0.15)' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center relative" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>
                    <span className="text-3xl font-display font-black text-white" data-testid="user-level">{user?.level}</span>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#ffd700] rounded-full flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)' }}>
                      <TrendingUp className="w-4 h-4 text-[#0a0e1a]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-white">Level {user?.level}</p>
                    <p className="text-[#a0aec0] text-sm">Warrior Rank</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-display font-bold bg-gradient-to-r from-[#ffd700] to-[#ffe44d] bg-clip-text text-transparent" data-testid="user-xp">
                    {user?.xp}
                  </p>
                  <p className="text-[#a0aec0] text-sm">/ {user?.xp_to_next_level} XP</p>
                </div>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <p className="text-center text-xs text-[#a0aec0] mt-2 font-medium">
                {user?.xp_to_next_level - user?.xp} XP until Level {user?.level + 1}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#ff4444]/20 to-[#cc0000]/10 border border-[#ff4444]/30 backdrop-blur-sm hover:border-[#ff6b6b] transition-all" style={{ boxShadow: '0 4px 20px rgba(255, 68, 68, 0.2)' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#ff4444]/30 flex items-center justify-center">
                  <Sword className="w-5 h-5 text-[#ff6b6b]" />
                </div>
                <p className="text-xs text-[#ff9999] uppercase tracking-wider font-semibold">Strength</p>
              </div>
              <p className="text-4xl font-display font-black stat-strength" data-testid="user-strength">
                {user?.strength}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#00d4ff]/20 to-[#0099cc]/10 border border-[#00d4ff]/30 backdrop-blur-sm hover:border-[#5ce1ff] transition-all" style={{ boxShadow: '0 4px 20px rgba(0, 212, 255, 0.2)' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#5ce1ff]" />
                </div>
                <p className="text-xs text-[#5ce1ff] uppercase tracking-wider font-semibold">Endurance</p>
              </div>
              <p className="text-4xl font-display font-black stat-endurance" data-testid="user-endurance">
                {user?.endurance}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#00ff88]/20 to-[#00cc66]/10 border border-[#00ff88]/30 backdrop-blur-sm hover:border-[#5affb8] transition-all" style={{ boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#5affb8]" />
                </div>
                <p className="text-xs text-[#5affb8] uppercase tracking-wider font-semibold">Agility</p>
              </div>
              <p className="text-4xl font-display font-black stat-agility" data-testid="user-agility">
                {user?.agility}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="weightlifting-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff4444] to-[#cc0000] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)' }}>
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-white">Weightlifting</h3>
                <p className="text-[#a0aec0] text-sm">Build strength & power</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#ff4444] transition-colors" />
            </div>
          </div>
          
          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/workout/cardio")}
            data-testid="cardio-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)' }}>
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-white">Cardio</h3>
                <p className="text-[#a0aec0] text-sm">Boost endurance & stamina</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#00d4ff] transition-colors" />
            </div>
          </div>

          <div 
            className="card-elevated p-5 cursor-pointer group"
            onClick={() => navigate("/calendar")}
            data-testid="calendar-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-white">Calendar</h3>
                <p className="text-[#a0aec0] text-sm">Track gym attendance</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#a855f7] transition-colors" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Quests */}
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#ffd700]" />
                  <h2 className="text-lg font-display font-bold text-white">Active Quests</h2>
                </div>
                <ChevronRight 
                  className="w-5 h-5 text-[#a0aec0] cursor-pointer hover:text-[#ffd700] transition-colors" 
                  onClick={() => navigate("/quests")}
                />
              </div>
              {quests.length === 0 ? (
                <p className="text-[#68687a] text-sm text-center py-8">No active quests. Complete workouts to unlock more!</p>
              ) : (
                <div className="space-y-3">
                  {quests.map(quest => {
                    const progress = (quest.progress / quest.target) * 100;
                    return (
                      <div key={quest.id} className="p-3 bg-[#0a0e1a]/50 rounded-lg border border-[#1a2332]">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white text-sm font-semibold">{quest.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] font-bold">
                            +{quest.xp_reward} XP
                          </span>
                        </div>
                        <div className="quest-progress-bar mb-1">
                          <div 
                            className="h-full rounded bg-gradient-to-r from-[#ffd700] to-[#ff8800]"
                            style={{ width: `${Math.min(progress, 100)}%`, boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                          ></div>
                        </div>
                        <p className="text-xs text-[#a0aec0]">{quest.progress} / {quest.target}</p>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#00ff88]" />
                  <h2 className="text-lg font-display font-bold text-white">Recent Activity</h2>
                </div>
                <ChevronRight 
                  className="w-5 h-5 text-[#a0aec0] cursor-pointer hover:text-[#00ff88] transition-colors" 
                  onClick={() => navigate("/history")}
                />
              </div>
              {recentWorkouts.length === 0 ? (
                <p className="text-[#68687a] text-sm text-center py-8">No workouts yet. Start your first training session!</p>
              ) : (
                <div className="space-y-3">
                  {recentWorkouts.map(workout => (
                    <div key={workout.id} className="p-3 bg-[#0a0e1a]/50 rounded-lg border border-[#1a2332] hover:border-[#00ff88]/30 transition-colors cursor-pointer" onClick={() => navigate("/history")}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          workout.workout_type === 'weightlifting' 
                            ? 'bg-[#ff4444]/20' 
                            : 'bg-[#00d4ff]/20'
                        }`}>
                          {workout.workout_type === 'weightlifting' ? (
                            <Dumbbell className="w-5 h-5 text-[#ff6b6b]" />
                          ) : (
                            <Flame className="w-5 h-5 text-[#5ce1ff]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold capitalize">{workout.workout_type}</p>
                          <p className="text-xs text-[#a0aec0]">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#ffd700] text-sm font-bold">+{workout.xp_earned} XP</p>
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
