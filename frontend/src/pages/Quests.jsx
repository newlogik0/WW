import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  ArrowLeft, 
  Clock,
  Calendar,
  RefreshCw,
  Check,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Quests() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const response = await api.get("/quests");
      setQuests(response.data);
    } catch (error) {
      console.error("Failed to load quests", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuests = async () => {
    setRefreshing(true);
    try {
      await api.post("/quests/refresh");
      await loadQuests();
      toast.success("Quests refreshed!");
    } catch (error) {
      toast.error("Failed to refresh quests");
    } finally {
      setRefreshing(false);
    }
  };

  const dailyQuests = quests.filter(q => q.quest_type === "daily");
  const weeklyQuests = quests.filter(q => q.quest_type === "weekly");

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

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

  const QuestCard = ({ quest }) => {
    const progress = (quest.progress / quest.target) * 100;
    
    return (
      <Card 
        className={`transition-all ${
          quest.completed 
            ? "bg-gradient-to-br from-[#4ade80]/20 to-[#0c0c12] border-[#4ade80]/50" 
            : "bg-[#0c0c12] border-[#1e1e2e] hover:border-[#8b5cf6]/50"
        }`}
        data-testid={`quest-${quest.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {quest.completed && (
                  <div className="w-5 h-5 bg-[#4ade80] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <h3 className={`font-display text-lg ${
                  quest.completed ? "text-[#4ade80]" : "text-white"
                }`}>
                  {quest.name}
                </h3>
              </div>
              <p className="text-[#a1a1aa] text-sm">{quest.description}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#8b5cf6]/20 text-[#a78bfa] text-sm font-medium">
                +{quest.xp_reward} XP
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#a1a1aa]\">Progress</span>
              <span className={quest.completed ? "text-[#4ade80]" : "text-white"}>
                {quest.progress}/{quest.target}
              </span>
            </div>
            <div className="quest-progress-bar">
              <div 
                className={`h-full rounded transition-all ${
                  quest.completed 
                    ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e]" 
                    : "bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9]"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {!quest.completed && (
            <div className="flex items-center gap-2 mt-4 text-xs text-[#71717a]">
              <Clock className="w-3 h-3" />
              <span>Expires in {getTimeRemaining(quest.expires_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#030304]" data-testid="quests-page">
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
              <Target className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-[#a78bfa]\">Quests</h1>
              <p className="text-[#a1a1aa]\">Complete challenges for bonus XP</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
            onClick={refreshQuests}
            disabled={refreshing}
            data-testid="refresh-quests-btn"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Daily Quests */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-xl font-display text-white">Daily Quests</h2>
          </div>
          {dailyQuests.length === 0 ? (
            <Card className="bg-[#0c0c12] border-[#1e1e2e]">
              <CardContent className="p-6 text-center text-[#71717a]">
                No daily quests available. Click refresh to get new quests!
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {dailyQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Quests */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-xl font-display text-white">Weekly Quests</h2>
          </div>
          {weeklyQuests.length === 0 ? (
            <Card className="bg-[#0c0c12] border-[#1e1e2e]">
              <CardContent className="p-6 text-center text-[#71717a]">
                No weekly quests available. Click refresh to get new quests!
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {weeklyQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
