import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  ArrowLeft, 
  Sword, 
  Shield, 
  Crown, 
  Star,
  Dumbbell,
  Mountain,
  Heart,
  Flame,
  Award,
  Gem,
  Lock
} from "lucide-react";
import Navbar from "@/components/Navbar";

const ICON_MAP = {
  sword: Sword,
  shield: Shield,
  trophy: Trophy,
  crown: Crown,
  star: Star,
  dumbbell: Dumbbell,
  mountain: Mountain,
  heart: Heart,
  flame: Flame,
  badge: Award,
  gem: Gem
};

export default function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await api.get("/achievements");
      setAchievements(response.data);
    } catch (error) {
      console.error("Failed to load achievements", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="achievements-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#ffd700]/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-2xl font-cinzel text-[#ffd700]">Achievements</h1>
              <p className="text-gray-400">Your legendary accomplishments</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#ffd700]" data-testid="achievement-count">
              {unlockedCount}/{achievements.length}
            </p>
            <p className="text-gray-400 text-sm">Unlocked</p>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = ICON_MAP[achievement.icon] || Trophy;
            return (
              <Card 
                key={achievement.id}
                className={`transition-all ${
                  achievement.unlocked 
                    ? "bg-gradient-to-br from-[#12121a] to-[#1a1a25] border-[#ffd700]/50 hover:border-[#ffd700]" 
                    : "bg-[#12121a]/50 border-[#2a2a3a] opacity-60"
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center relative ${
                      achievement.unlocked 
                        ? "bg-[#ffd700]/20" 
                        : "bg-[#2a2a3a]/50"
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className="w-8 h-8 text-[#ffd700]" />
                      ) : (
                        <Lock className="w-8 h-8 text-gray-600" />
                      )}
                      {achievement.unlocked && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-cinzel text-lg mb-1 ${
                        achievement.unlocked ? "text-white" : "text-gray-500"
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        achievement.unlocked ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {achievement.description}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        achievement.unlocked 
                          ? "bg-[#ffd700]/20 text-[#ffd700]" 
                          : "bg-[#2a2a3a]/50 text-gray-500"
                      }`}>
                        +{achievement.xp_reward} XP
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-xs text-gray-500 mt-4 text-right">
                      Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
