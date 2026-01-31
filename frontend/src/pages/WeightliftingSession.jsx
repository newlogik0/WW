import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Upload,
  FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";

const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
  "Bicep Curl", "Tricep Extension", "Lat Pulldown", "Leg Press", "Lunges",
  "Pull Up", "Push Up", "Dumbbell Fly", "Shoulder Press", "Romanian Deadlift"
];

// Tempo Tracker Component - Improved with shorter defaults
const TempoTracker = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  // Shorter tempo settings (in seconds) - more realistic
  const [eccentricTime, setEccentricTime] = useState(2);
  const [holdTime, setHoldTime] = useState(1);
  const [concentricTime, setConcentricTime] = useState(1);
  
  const intervalRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    } catch (e) {}
  }, []);

  const runTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const newTime = prev + 0.1;
        return newTime;
      });
    }, 100);
  }, []);

  // Check phase transitions
  const checkPhaseTransition = useCallback(() => {
    if (phase === "eccentric" && timer >= eccentricTime) {
      setPhase("hold");
      setTimer(0);
      playBeep();
    } else if (phase === "hold" && timer >= holdTime) {
      setPhase("concentric");
      setTimer(0);
      playBeep();
    } else if (phase === "concentric" && timer >= concentricTime) {
      setPhase("eccentric");
      setTimer(0);
      setRepCount(prev => prev + 1);
      playBeep();
    }
  }, [phase, timer, eccentricTime, holdTime, concentricTime, playBeep]);

  // Effect for phase transitions
  useState(() => {
    if (isRunning && phase !== "ready") {
      checkPhaseTransition();
    }
  });

  // Timer effect
  useState(() => {
    if (isRunning && phase !== "ready") {
      runTimer();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  });

  const startTimer = () => {
    setIsRunning(true);
    setPhase("eccentric");
    setTimer(0);
    playBeep();
    runTimer();
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase("ready");
    setTimer(0);
    setRepCount(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const finishSet = () => {
    pauseTimer();
    if (onComplete && repCount > 0) onComplete(repCount);
    resetTimer();
  };

  // Manual phase check on timer update
  if (isRunning && phase !== "ready") {
    if (phase === "eccentric" && timer >= eccentricTime) {
      setPhase("hold");
      setTimer(0);
      playBeep();
    } else if (phase === "hold" && timer >= holdTime) {
      setPhase("concentric");
      setTimer(0);
      playBeep();
    } else if (phase === "concentric" && timer >= concentricTime) {
      setPhase("eccentric");
      setTimer(0);
      setRepCount(prev => prev + 1);
      playBeep();
    }
  }

  const getTimeRemaining = () => {
    switch (phase) {
      case "eccentric": return Math.max(0, eccentricTime - timer).toFixed(1);
      case "hold": return Math.max(0, holdTime - timer).toFixed(1);
      case "concentric": return Math.max(0, concentricTime - timer).toFixed(1);
      default: return "0.0";
    }
  };

  return (
    <Card className="bg-[#1c1c21] border-[#2e2e33]" data-testid="tempo-tracker">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#d4af37]" />
            Rep Counter
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-5">
          {/* Tempo Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#71717a]">Lower (s)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={eccentricTime}
                onChange={(e) => setEccentricTime(Number(e.target.value))}
                className="bg-[#18181b] border-[#ef4444]/30 text-white text-center h-9"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#71717a]">Hold (s)</Label>
              <Input
                type="number"
                min="0"
                max="5"
                value={holdTime}
                onChange={(e) => setHoldTime(Number(e.target.value))}
                className="bg-[#18181b] border-[#d4af37]/30 text-white text-center h-9"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#71717a]">Lift (s)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={concentricTime}
                onChange={(e) => setConcentricTime(Number(e.target.value))}
                className="bg-[#18181b] border-[#06b6d4]/30 text-white text-center h-9"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Visual Rings */}
          <div className="flex justify-center items-center gap-3">
            <div className={`tempo-ring tempo-eccentric ${phase === 'eccentric' ? 'active' : ''}`}>
              {phase === 'eccentric' ? getTimeRemaining() : eccentricTime}
            </div>
            <div className={`tempo-ring tempo-hold ${phase === 'hold' ? 'active' : ''}`}>
              {phase === 'hold' ? getTimeRemaining() : holdTime}
            </div>
            <div className={`tempo-ring tempo-concentric ${phase === 'concentric' ? 'active' : ''}`}>
              {phase === 'concentric' ? getTimeRemaining() : concentricTime}
            </div>
          </div>

          {/* Phase & Reps */}
          <div className="text-center">
            <p className={`text-2xl font-display font-bold ${
              phase === 'eccentric' ? 'text-[#ef4444]' : 
              phase === 'hold' ? 'text-[#d4af37]' : 
              phase === 'concentric' ? 'text-[#06b6d4]' : 'text-[#71717a]'
            }`}>
              {phase === 'ready' ? 'READY' : phase === 'eccentric' ? 'LOWER' : phase === 'hold' ? 'HOLD' : 'LIFT'}
            </p>
            <p className="text-[#a1a1aa] mt-1">
              Reps: <span className="text-[#d4af37] font-bold text-xl">{repCount}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning && phase === "ready" && (
              <Button
                onClick={startTimer}
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                data-testid="tempo-start-btn"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            {isRunning && (
              <Button onClick={pauseTimer} className="bg-[#d4af37] hover:bg-[#c9a227] text-black">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {!isRunning && phase !== "ready" && (
              <Button onClick={startTimer} className="bg-[#10b981] hover:bg-[#059669] text-white">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {phase !== "ready" && (
              <>
                <Button onClick={resetTimer} variant="outline" className="border-[#2e2e33] text-[#a1a1aa]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={finishSet} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white" data-testid="tempo-finish-btn">
                  <Check className="w-4 h-4 mr-2" />
                  Done ({repCount})
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
  const [activePlan, setActivePlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Load active plan on mount
  useState(() => {
    const loadPlan = async () => {
      try {
        const res = await api.get("/plans/active");
        if (res.data && res.data.exercises?.length > 0) {
          setActivePlan(res.data);
          setExercises(res.data.exercises.map(e => ({
            name: e.name || "",
            sets: e.sets || 3,
            reps: e.reps || 10,
            weight: e.weight || 0,
            tempo: e.tempo || ""
          })));
        }
      } catch (e) {
        console.log("No active plan");
      } finally {
        setLoadingPlan(false);
      }
    };
    loadPlan();
  });

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
      toast.error("Add at least one exercise");
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
          <p className="font-semibold">Workout Complete!</p>
          <p className="text-sm">+{response.data.xp_earned} XP earned</p>
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
    <div className="min-h-screen bg-[#09090b]" data-testid="weightlifting-session-page">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="text-[#a1a1aa] hover:text-white mb-4 h-8 px-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#ef4444]/15 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Weightlifting</h1>
            <p className="text-[#71717a] text-sm">Build strength and earn XP</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
            onClick={() => navigate("/plans")}
          >
            <Upload className="w-4 h-4 mr-1" />
            Import Plan
          </Button>
        </div>

        {/* Active Plan Notice */}
        {activePlan && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg">
            <FileText className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm text-[#d4af37]">Using plan: {activePlan.name}</span>
          </div>
        )}

        {/* Tempo Tracker */}
        <div className="mb-4">
          <TempoTracker onComplete={handleTempoComplete} />
        </div>

        {/* Exercises */}
        <Card className="bg-[#1c1c21] border-[#2e2e33] mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-white">Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((exercise, index) => (
              <div key={index} className="p-3 bg-[#18181b] rounded-lg space-y-3" data-testid={`exercise-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a] text-xs">Exercise {index + 1}</span>
                  {exercises.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#ef4444] hover:bg-[#ef4444]/10"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#71717a]">Exercise</Label>
                    <select
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                      className="w-full h-9 px-3 bg-[#09090b] border border-[#2e2e33] rounded-md text-white text-sm focus:outline-none focus:border-[#d4af37]"
                      data-testid={`exercise-select-${index}`}
                    >
                      <option value="">Select</option>
                      {COMMON_EXERCISES.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#71717a]">Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, "weight", Number(e.target.value))}
                      className="bg-[#09090b] border-[#2e2e33] text-white h-9"
                      data-testid={`exercise-weight-${index}`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#71717a]">Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, "sets", Number(e.target.value))}
                      className="bg-[#09090b] border-[#2e2e33] text-white h-9"
                      data-testid={`exercise-sets-${index}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#71717a]">Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", Number(e.target.value))}
                      className="bg-[#09090b] border-[#2e2e33] text-white h-9"
                      data-testid={`exercise-reps-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-[#2e2e33] text-[#71717a] hover:text-white hover:border-[#d4af37] h-9"
              onClick={addExercise}
              data-testid="add-exercise-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-[#1c1c21] border-[#2e2e33] mb-4">
          <CardContent className="pt-4">
            <Label className="text-xs text-[#71717a]">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full mt-1.5 p-3 bg-[#18181b] border border-[#2e2e33] rounded-lg text-white placeholder:text-[#71717a] text-sm focus:outline-none focus:border-[#d4af37] min-h-[80px] resize-none"
              data-testid="workout-notes"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#f87171] hover:to-[#ef4444] text-white font-semibold h-12"
          data-testid="complete-workout-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Dumbbell className="w-4 h-4 mr-2" />
              Complete Workout
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
