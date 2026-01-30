import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";

const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
  "Bicep Curl", "Tricep Extension", "Lat Pulldown", "Leg Press", "Lunges",
  "Pull Up", "Push Up", "Dumbbell Fly", "Shoulder Press", "Romanian Deadlift"
];

// Tempo Tracker Component
const TempoTracker = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("ready"); // ready, eccentric, hold, concentric, complete
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  // Tempo settings (in seconds)
  const [eccentricTime, setEccentricTime] = useState(3);
  const [holdTime, setHoldTime] = useState(1);
  const [concentricTime, setConcentricTime] = useState(2);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const playBeep = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Create audio context for beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && phase !== "ready" && phase !== "complete") {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 0.1;
          
          // Check phase transitions
          if (phase === "eccentric" && newTime >= eccentricTime) {
            setPhase("hold");
            playBeep();
            return 0;
          } else if (phase === "hold" && newTime >= holdTime) {
            setPhase("concentric");
            playBeep();
            return 0;
          } else if (phase === "concentric" && newTime >= concentricTime) {
            setPhase("eccentric");
            setRepCount(prev => prev + 1);
            playBeep();
            return 0;
          }
          
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, eccentricTime, holdTime, concentricTime, playBeep]);

  const startTimer = () => {
    setIsRunning(true);
    setPhase("eccentric");
    setTimer(0);
    playBeep();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("ready");
    setTimer(0);
    setRepCount(0);
  };

  const finishSet = () => {
    setIsRunning(false);
    if (onComplete) onComplete(repCount);
    resetTimer();
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "eccentric": return "text-[#dc2626] border-[#dc2626]";
      case "hold": return "text-[#ffd700] border-[#ffd700]";
      case "concentric": return "text-[#22d3d3] border-[#22d3d3]";
      default: return "text-gray-400 border-gray-600";
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "eccentric": return "LOWER";
      case "hold": return "HOLD";
      case "concentric": return "LIFT";
      default: return "READY";
    }
  };

  const getMaxTime = () => {
    switch (phase) {
      case "eccentric": return eccentricTime;
      case "hold": return holdTime;
      case "concentric": return concentricTime;
      default: return 1;
    }
  };

  return (
    <Card className="bg-[#12121a] border-[#2a2a3a]" data-testid="tempo-tracker">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-lg font-cinzel text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#ffd700]" />
            Tempo Tracker
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-400">Eccentric (s)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={eccentricTime}
                onChange={(e) => setEccentricTime(Number(e.target.value))}
                className="bg-[#1a1a25] border-[#dc2626]/50 text-white text-center"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Hold (s)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={holdTime}
                onChange={(e) => setHoldTime(Number(e.target.value))}
                className="bg-[#1a1a25] border-[#ffd700]/50 text-white text-center"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Concentric (s)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={concentricTime}
                onChange={(e) => setConcentricTime(Number(e.target.value))}
                className="bg-[#1a1a25] border-[#22d3d3]/50 text-white text-center"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Visual Display */}
          <div className="flex justify-center items-center gap-4">
            <div className={`tempo-circle ${phase === 'eccentric' ? 'tempo-phase active' : ''} border-[#dc2626]/30 ${phase === 'eccentric' ? 'bg-[#dc2626]/20' : 'bg-transparent'}`}>
              <span className={phase === 'eccentric' ? 'text-[#dc2626]' : 'text-gray-600'}>
                {phase === 'eccentric' ? (eccentricTime - timer).toFixed(1) : eccentricTime}
              </span>
            </div>
            <div className={`tempo-circle ${phase === 'hold' ? 'tempo-phase active' : ''} border-[#ffd700]/30 ${phase === 'hold' ? 'bg-[#ffd700]/20' : 'bg-transparent'}`}>
              <span className={phase === 'hold' ? 'text-[#ffd700]' : 'text-gray-600'}>
                {phase === 'hold' ? (holdTime - timer).toFixed(1) : holdTime}
              </span>
            </div>
            <div className={`tempo-circle ${phase === 'concentric' ? 'tempo-phase active' : ''} border-[#22d3d3]/30 ${phase === 'concentric' ? 'bg-[#22d3d3]/20' : 'bg-transparent'}`}>
              <span className={phase === 'concentric' ? 'text-[#22d3d3]' : 'text-gray-600'}>
                {phase === 'concentric' ? (concentricTime - timer).toFixed(1) : concentricTime}
              </span>
            </div>
          </div>

          {/* Phase indicator */}
          <div className="text-center">
            <p className={`text-3xl font-bold font-cinzel ${getPhaseColor()}`}>
              {getPhaseLabel()}
            </p>
            <p className="text-gray-400 mt-2">Reps: <span className="text-[#ffd700] font-bold text-xl">{repCount}</span></p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning && phase === "ready" && (
              <Button
                onClick={startTimer}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white"
                data-testid="tempo-start-btn"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            {isRunning && (
              <Button
                onClick={pauseTimer}
                className="bg-[#ffd700] hover:bg-[#b8860b] text-black"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {!isRunning && phase !== "ready" && (
              <Button
                onClick={startTimer}
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {phase !== "ready" && (
              <>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={finishSet}
                  className="bg-[#a855f7] hover:bg-[#9333ea] text-white"
                  data-testid="tempo-finish-btn"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Finish Set ({repCount} reps)
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function WeightliftingSession() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([
    { name: "", sets: 3, reps: 10, weight: 0, tempo: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, weight: 0, tempo: "" }]);
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleTempoComplete = (reps) => {
    toast.success(`Set completed with ${reps} reps!`);
  };

  const handleSubmit = async () => {
    const validExercises = exercises.filter(e => e.name && e.sets > 0 && e.reps > 0);
    
    if (validExercises.length === 0) {
      toast.error("Add at least one exercise with valid data");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post("/workouts/weightlifting", {
        exercises: validExercises,
        notes
      });
      
      await refreshUser();
      
      toast.success(
        <div>
          <p className="font-bold">Workout Complete!</p>
          <p>+{response.data.xp_earned} XP earned</p>
          {response.data.stats_gained?.strength > 0 && (
            <p className="text-[#dc2626]">+{response.data.stats_gained.strength} Strength</p>
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
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="weightlifting-session-page">
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
          <div className="w-14 h-14 rounded-xl bg-[#dc2626]/20 flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-[#dc2626]" />
          </div>
          <div>
            <h1 className="text-2xl font-cinzel text-[#ffd700]">Weightlifting Session</h1>
            <p className="text-gray-400">Build strength and earn XP</p>
          </div>
        </div>

        {/* Tempo Tracker */}
        <div className="mb-6">
          <TempoTracker onComplete={handleTempoComplete} />
        </div>

        {/* Exercises */}
        <Card className="bg-[#12121a] border-[#2a2a3a] mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-white">Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="p-4 bg-[#1a1a25] rounded-lg space-y-4" data-testid={`exercise-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Exercise {index + 1}</span>
                  {exercises.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm">Exercise Name</Label>
                    <Select
                      value={exercise.name}
                      onValueChange={(value) => updateExercise(index, "name", value)}
                    >
                      <SelectTrigger className="bg-[#12121a] border-[#2a2a3a] text-white">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121a] border-[#2a2a3a]">
                        {COMMON_EXERCISES.map((ex) => (
                          <SelectItem key={ex} value={ex} className="text-white hover:bg-[#2a2a3a]">
                            {ex}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-400 text-sm">Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, "weight", Number(e.target.value))}
                      className="bg-[#12121a] border-[#2a2a3a] text-white"
                      data-testid={`exercise-weight-${index}`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-sm">Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, "sets", Number(e.target.value))}
                      className="bg-[#12121a] border-[#2a2a3a] text-white"
                      data-testid={`exercise-sets-${index}`}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-sm">Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", Number(e.target.value))}
                      className="bg-[#12121a] border-[#2a2a3a] text-white"
                      data-testid={`exercise-reps-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-[#2a2a3a] text-gray-400 hover:text-white hover:border-[#ffd700]"
              onClick={addExercise}
              data-testid="add-exercise-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
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
              className="w-full mt-2 p-3 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ffd700] min-h-[100px]"
              data-testid="workout-notes"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-semibold py-6 text-lg"
          data-testid="complete-workout-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Dumbbell className="w-5 h-5 mr-2" />
              Complete Workout
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
