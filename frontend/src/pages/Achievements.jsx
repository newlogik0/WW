import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="min-h-screen bg-[#0d0d0d]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="achievements-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-[#b3b3b3] hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#00d9ff]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Achievements</h1>
              <p className="text-[#b3b3b3] text-sm">Your legendary accomplishments</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#00d9ff]" data-testid="achievement-count">
              {unlockedCount}/{achievements.length}
            </p>
            <p className="text-[#b3b3b3] text-sm">Unlocked</p>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = ICON_MAP[achievement.icon] || Trophy;
            return (
              <Card 
                key={achievement.id}
                className={`transition-all ${
                  achievement.unlocked 
                    ? "bg-[#1a1a1a] border-[#00d9ff]/30 hover:border-[#00d9ff]/50" 
                    : "bg-[#1a1a1a]/50 border-[#333333] opacity-60"
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative ${
                      achievement.unlocked 
                        ? "bg-[#00d9ff]/10 border border-[#00d9ff]/20" 
                        : "bg-[#262626]"
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className="w-7 h-7 text-[#00d9ff]" />
                      ) : (
                        <Lock className="w-7 h-7 text-[#808080]" />
                      )}
                      {achievement.unlocked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00ff88] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-base mb-1 ${
                        achievement.unlocked ? "text-white" : "text-[#808080]"
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        achievement.unlocked ? "text-[#b3b3b3]" : "text-[#808080]"
                      }`}>
                        {achievement.description}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        achievement.unlocked 
                          ? "bg-[#00d9ff]/10 text-[#00d9ff]" 
                          : "bg-[#262626] text-[#808080]"
                      }`}>
                        +{achievement.xp_reward} XP
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-xs text-[#808080] mt-3 text-right">
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
