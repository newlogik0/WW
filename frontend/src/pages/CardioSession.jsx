import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Flame, 
  ArrowLeft, 
  Timer,
  MapPin,
  Loader2,
  Bike,
  Waves,
  Footprints
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

export default function CardioSession() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="cardio-session-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate("/workout")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#22d3d3]/20 flex items-center justify-center">
            <Flame className="w-7 h-7 text-[#22d3d3]" />
          </div>
          <div>
            <h1 className="text-2xl font-cinzel text-[#ffd700]">Cardio Session</h1>
            <p className="text-gray-400">Build endurance and earn XP</p>
          </div>
        </div>

        {/* Activity Selection */}
        <Card className="bg-[#12121a] border-[#2a2a3a] mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-white">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CARDIO_ACTIVITIES.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.value}
                    onClick={() => setActivity(act.value)}
                    className={`p-4 rounded-lg border transition-all ${
                      activity === act.value
                        ? "bg-[#22d3d3]/20 border-[#22d3d3] text-[#22d3d3]"
                        : "bg-[#1a1a25] border-[#2a2a3a] text-gray-400 hover:border-[#22d3d3]/50"
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
        <Card className="bg-[#12121a] border-[#2a2a3a] mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-white">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-400 flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4" />
                Duration (minutes)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-[#1a1a25] border-[#2a2a3a] text-white text-center text-2xl w-32"
                  data-testid="cardio-duration"
                />
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <Button
                      key={mins}
                      variant="outline"
                      size="sm"
                      onClick={() => setDuration(mins)}
                      className={`${
                        duration === mins 
                          ? "bg-[#22d3d3]/20 border-[#22d3d3] text-[#22d3d3]" 
                          : "border-[#2a2a3a] text-gray-400"
                      }`}
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-gray-400 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Distance (km) - optional
              </Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g., 5.0"
                className="bg-[#1a1a25] border-[#2a2a3a] text-white max-w-xs"
                data-testid="cardio-distance"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-[#12121a] border-[#2a2a3a] mb-6">
          <CardContent className="pt-6">
            <Label className="text-gray-400">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full mt-2 p-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#22d3d3] min-h-[100px]"
              data-testid="cardio-notes"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !activity}
          className="w-full bg-gradient-to-r from-[#22d3d3] to-[#0891b2] hover:from-[#5eead4] hover:to-[#22d3d3] text-[#0a0a0f] font-semibold py-6 text-lg"
          data-testid="complete-cardio-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5 mr-2" />
              Complete Cardio
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
