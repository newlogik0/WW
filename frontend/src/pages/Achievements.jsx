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
      <div className="min-h-screen bg-[#030304]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030304]" data-testid="achievements-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-[#a1a1aa] hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-[#a78bfa]">Achievements</h1>
              <p className="text-[#a1a1aa]">Your legendary accomplishments</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#a78bfa]" data-testid="achievement-count">
              {unlockedCount}/{achievements.length}
            </p>
            <p className="text-[#a1a1aa] text-sm">Unlocked</p>
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
                    ? "bg-gradient-to-br from-[#0c0c12] to-[#14141e] border-[#8b5cf6]/50 hover:border-[#a78bfa]" 
                    : "bg-[#0c0c12]/50 border-[#1e1e2e] opacity-60"
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center relative ${
                      achievement.unlocked 
                        ? "bg-[#8b5cf6]/20" 
                        : "bg-[#1e1e2e]/50"
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className="w-8 h-8 text-[#a78bfa]" />
                      ) : (
                        <Lock className="w-8 h-8 text-[#52525b]" />
                      )}
                      {achievement.unlocked && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4ade80] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-display text-lg mb-1 ${
                        achievement.unlocked ? "text-white" : "text-[#71717a]"
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        achievement.unlocked ? "text-[#a1a1aa]" : "text-[#52525b]"
                      }`}>
                        {achievement.description}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        achievement.unlocked 
                          ? "bg-[#8b5cf6]/20 text-[#a78bfa]" 
                          : "bg-[#1e1e2e]/50 text-[#71717a]"
                      }`}>
                        +{achievement.xp_reward} XP
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-xs text-[#71717a] mt-4 text-right">
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
