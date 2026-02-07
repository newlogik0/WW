import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Flame, 
  ArrowLeft, 
  Timer,
  MapPin,
  Loader2,
  Bike,
  Waves,
  Footprints,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Navbar from "@/components/Navbar";

const CARDIO_ACTIVITIES = [
  { value: "running", label: "Running", icon: Footprints },
  { value: "cycling", label: "Cycling", icon: Bike },
  { value: "swimming", label: "Swimming", icon: Waves },
  { value: "hiit", label: "HIIT", icon: Flame },
  { value: "rowing", label: "Rowing", icon: Waves },
  { value: "jump_rope", label: "Jump Rope", icon: Timer },
  { value: "elliptical", label: "Elliptical", icon: Timer },
  { value: "stair_climbing", label: "Stair Climbing", icon: Footprints },
];

// Cardio Animation Component
const CardioAnimation = ({ activity, duration, isActive }) => {
  const [showAnimation, setShowAnimation] = useState("character"); // 'character' or 'progress'
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && duration > 0) {
      const totalSeconds = duration * 60;
      setTimeRemaining(totalSeconds);
      
      const increment = 100 / totalSeconds; // Update every second
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            return 100;
          }
          return prev + increment;
        });
        
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setProgress(0);
      setTimeRemaining(duration * 60);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnimationClass = () => {
    if (!isActive) return "";
    switch(activity) {
      case "running":
      case "stair_climbing":
        return "cardio-runner";
      case "cycling":
        return "cardio-cyclist";
      case "swimming":
        return "cardio-swimmer";
      default:
        return "animate-pulse";
    }
  };

  const Icon = CARDIO_ACTIVITIES.find(a => a.value === activity)?.icon || Flame;

  return (
    <Card className="bg-[#0a0a10] border-[#1a1a28]">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#06b6d4]" />
            Cardio Animation
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Animation Type Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#06060a] rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showAnimation === "character"}
                  onCheckedChange={(checked) => setShowAnimation(checked ? "character" : "progress")}
                  className="data-[state=checked]:bg-[#06b6d4]"
                />
                <Label className="text-xs text-[#a8a8b8]">Character</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showAnimation === "progress"}
                  onCheckedChange={(checked) => setShowAnimation(checked ? "progress" : "character")}
                  className="data-[state=checked]:bg-[#06b6d4]"
                />
                <Label className="text-xs text-[#a8a8b8]">Progress Bar</Label>
              </div>
            </div>
          </div>

          {/* Animation Display */}
          <div className="flex justify-center items-center min-h-[140px]">
            {showAnimation === "character" ? (
              <div className="cardio-animation">
                <Icon className={`w-20 h-20 text-[#06b6d4] ${getAnimationClass()}`} />
                {isActive && (
                  <div className="text-center mt-4">
                    <p className="text-3xl font-display font-bold text-[#06b6d4]">
                      {formatTime(timeRemaining)}
                    </p>
                    <p className="text-xs text-[#68687a] mt-1">Time Remaining</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="mb-2 text-center">
                  <span className="text-3xl font-display font-bold text-[#06b6d4]">
                    {isActive ? formatTime(timeRemaining) : `${duration}:00`}
                  </span>
                  <p className="text-xs text-[#68687a] mt-1">
                    {isActive ? "Time Remaining" : "Duration"}
                  </p>
                </div>
                <div className="h-6 bg-[#06060a] rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#68687a]">
                  <span>Start</span>
                  <span>{Math.round(progress)}%</span>
                  <span>{duration} min</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-[#a8a8b8]">
              {isActive ? "Training in progress..." : "Start your cardio session to see animation"}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function CardioSession() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const handleSubmit = async () => {
    if (!activity) {
      toast.error("Please select an activity");
      return;
    }
    
    if (duration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post("/workouts/cardio", {
        activity,
        duration_minutes: duration,
        distance_km: distance ? Number(distance) : null,
        notes
      });
      
      await refreshUser();
      
      toast.success(
        <div>
          <p className="font-bold">Cardio Complete!</p>
          <p>+{response.data.xp_earned} XP earned</p>
          {response.data.stats_gained?.endurance > 0 && (
            <p className="text-[#22d3d3]">+{response.data.stats_gained.endurance} Endurance</p>
          )}
        </div>
      );
      
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="cardio-session-page">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="text-[#a8a8b8] hover:text-white mb-4 h-8 px-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Cardio Session</h1>
            <p className="text-[#68687a] text-sm">Build endurance and earn XP</p>
          </div>
        </div>

        {/* Cardio Animation */}
        <div className="mb-4">
          <CardioAnimation activity={activity} duration={duration} isActive={isTraining} />
        </div>

        {/* Activity Selection */}
        <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-white">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CARDIO_ACTIVITIES.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.value}
                    onClick={() => setActivity(act.value)}
                    className={`p-3 rounded-lg border transition-all ${
                      activity === act.value
                        ? "bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]"
                        : "bg-[#06060a] border-[#1a1a28] text-[#a8a8b8] hover:border-[#06b6d4]/50"
                    }`}
                    data-testid={`activity-${act.value}`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Duration & Distance */}
        <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-white">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#68687a] text-xs flex items-center gap-2 mb-2">
                <Timer className="w-3 h-3" />
                Duration (minutes)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-[#06060a] border-[#1a1a28] text-white text-center text-xl w-24 h-9"
                  data-testid="cardio-duration"
                />
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <Button
                      key={mins}
                      variant="outline"
                      size="sm"
                      onClick={() => setDuration(mins)}
                      className={`h-8 ${
                        duration === mins 
                          ? "bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]" 
                          : "border-[#1a1a28] text-[#68687a] hover:border-[#06b6d4]/50"
                      }`}
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-[#68687a] text-xs flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3" />
                Distance (km) - optional
              </Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g., 5.0"
                className="bg-[#06060a] border-[#1a1a28] text-white max-w-xs h-9"
                data-testid="cardio-distance"
              />
            </div>

            {/* Start/Stop Training Button */}
            <div className="pt-2">
              <Button
                variant={isTraining ? "outline" : "default"}
                className={isTraining 
                  ? "w-full border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 h-10" 
                  : "w-full bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4] hover:bg-[#06b6d4]/30 h-10"
                }
                onClick={() => setIsTraining(!isTraining)}
              >
                {isTraining ? "Stop Training" : "Start Training"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
          <CardContent className="pt-4">
            <Label className="text-[#68687a] text-xs">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full mt-1.5 p-3 bg-[#06060a] border border-[#1a1a28] rounded-lg text-white placeholder:text-[#68687a] text-sm focus:outline-none focus:border-[#06b6d4] min-h-[80px] resize-none"
              data-testid="cardio-notes"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !activity}
          className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#22d3ee] hover:to-[#06b6d4] text-white font-semibold h-12"
          data-testid="complete-cardio-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 mr-2" />
              Complete Cardio
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
