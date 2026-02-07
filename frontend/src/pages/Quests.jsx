import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="min-h-screen bg-[#0d0d0d]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
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
            ? "bg-[#1a1a1a] border-[#00ff88]/30" 
            : "bg-[#1a1a1a] border-[#333333] hover:border-[#00d9ff]/30"
        }`}
        data-testid={`quest-${quest.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {quest.completed && (
                  <div className="w-5 h-5 bg-[#00ff88] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <h3 className={`font-semibold ${
                  quest.completed ? "text-[#00ff88]" : "text-white"
                }`}>
                  {quest.name}
                </h3>
              </div>
              <p className="text-[#b3b3b3] text-sm">{quest.description}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00d9ff]/10 text-[#00d9ff] text-sm font-medium">
                +{quest.xp_reward} XP
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#b3b3b3]">Progress</span>
              <span className={quest.completed ? "text-[#00ff88]" : "text-white"}>
                {quest.progress}/{quest.target}
              </span>
            </div>
            <div className="quest-progress-bar">
              <div 
                className={`h-full rounded transition-all ${
                  quest.completed 
                    ? "bg-[#00ff88]" 
                    : "bg-[#00d9ff]"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {!quest.completed && (
            <div className="flex items-center gap-2 mt-3 text-xs text-[#808080]">
              <Clock className="w-3 h-3" />
              <span>Expires in {getTimeRemaining(quest.expires_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="quests-page">
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
              <Target className="w-6 h-6 text-[#00d9ff]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Quests</h1>
              <p className="text-[#b3b3b3] text-sm">Complete challenges for bonus XP</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]"
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
            <Clock className="w-5 h-5 text-[#00d9ff]" />
            <h2 className="text-lg font-semibold text-white">Daily Quests</h2>
          </div>
          {dailyQuests.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardContent className="p-6 text-center text-[#808080]">
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
            <Calendar className="w-5 h-5 text-[#00d9ff]" />
            <h2 className="text-lg font-semibold text-white">Weekly Quests</h2>
          </div>
          {weeklyQuests.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-[#333333]">
              <CardContent className="p-6 text-center text-[#808080]">
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
