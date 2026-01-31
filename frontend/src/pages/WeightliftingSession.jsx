import { useState, useRef, useCallback, useEffect } from "react";
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

// Tempo Tracker Component - Fully customizable with decimal support
const TempoTracker = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  
  // Default: 1s lower, 2s hold, 1s lift - fully customizable with decimals
  const [eccentricTime, setEccentricTime] = useState(1);
  const [holdTime, setHoldTime] = useState(2);
  const [concentricTime, setConcentricTime] = useState(1);
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(phase);
  const timerRef = useRef(timer);

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase;
    timerRef.current = timer;
  }, [phase, timer]);

  const playBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 80);
    } catch (e) {}
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runTimer = useCallback(() => {
    stopTimer();
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        const newTime = prev + 0.05;
        const currentPhase = phaseRef.current;
        
        let targetTime;
        if (currentPhase === "eccentric") targetTime = eccentricTime;
        else if (currentPhase === "hold") targetTime = holdTime;
        else if (currentPhase === "concentric") targetTime = concentricTime;
        else return prev;
        
        if (newTime >= targetTime) {
          // Transition to next phase
          if (currentPhase === "eccentric") {
            setPhase("hold");
            playBeep();
            return 0;
          } else if (currentPhase === "hold") {
            setPhase("concentric");
            playBeep();
            return 0;
          } else if (currentPhase === "concentric") {
            setPhase("eccentric");
            setRepCount(r => r + 1);
            playBeep();
            return 0;
          }
        }
        
        return newTime;
      });
    }, 50);
  }, [eccentricTime, holdTime, concentricTime, playBeep, stopTimer]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setPhase("eccentric");
    setTimer(0);
    playBeep();
    setTimeout(() => runTimer(), 50);
  }, [playBeep, runTimer]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    stopTimer();
  }, [stopTimer]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    setPhase("ready");
    setTimer(0);
    setRepCount(0);
  }, [stopTimer]);

  const finishSet = useCallback(() => {
    pauseTimer();
    if (onComplete && repCount > 0) onComplete(repCount);
    resetTimer();
  }, [pauseTimer, onComplete, repCount, resetTimer]);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    runTimer();
  }, [runTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const getTimeRemaining = () => {
    let target;
    if (phase === "eccentric") target = eccentricTime;
    else if (phase === "hold") target = holdTime;
    else if (phase === "concentric") target = concentricTime;
    else return "0.00";
    return Math.max(0, target - timer).toFixed(2);
  };

  const handleTimeChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    }
  };

  return (
    <Card className="bg-[#0c0c12] border-[#1e1e2e]" data-testid="tempo-tracker">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#8b5cf6]" />
            Rep Counter
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-5">
          {/* Tempo Settings - Fully customizable */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#71717a] mb-1 block">Lower (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={eccentricTime}
                onChange={handleTimeChange(setEccentricTime)}
                className="bg-[#08080c] border-[#ef4444]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#71717a] mb-1 block">Hold (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={holdTime}
                onChange={handleTimeChange(setHoldTime)}
                className="bg-[#08080c] border-[#f59e0b]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#71717a] mb-1 block">Lift (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.001"
                value={concentricTime}
                onChange={handleTimeChange(setConcentricTime)}
                className="bg-[#08080c] border-[#06b6d4]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Visual Rings */}
          <div className="flex justify-center items-center gap-4">
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
              phase === 'hold' ? 'text-[#f59e0b]' : 
              phase === 'concentric' ? 'text-[#06b6d4]' : 'text-[#71717a]'
            }`}>
              {phase === 'ready' ? 'READY' : phase === 'eccentric' ? 'LOWER' : phase === 'hold' ? 'HOLD' : 'LIFT'}
            </p>
            <p className="text-[#a1a1aa] mt-1">
              Reps: <span className="text-[#a78bfa] font-bold text-xl">{repCount}</span>
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
              <Button onClick={pauseTimer} className="bg-[#f59e0b] hover:bg-[#d97706] text-black">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {!isRunning && phase !== "ready" && (
              <Button onClick={resumeTimer} className="bg-[#10b981] hover:bg-[#059669] text-white">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {phase !== "ready" && (
              <>
                <Button onClick={resetTimer} variant="outline" className="border-[#1e1e2e] text-[#a1a1aa]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={finishSet} className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white" data-testid="tempo-finish-btn">
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

  // Load active plan on mount
  useEffect(() => {
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
      }
    };
    loadPlan();
  }, []);

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
    <div className="min-h-screen bg-[#030304]" data-testid="weightlifting-session-page">
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
            className="ml-auto border-[#6d28d9] text-[#a78bfa] hover:bg-[#6d28d9]/10"
            onClick={() => navigate("/plans")}
          >
            <Upload className="w-4 h-4 mr-1" />
            Import Plan
          </Button>
        </div>

        {/* Active Plan Notice */}
        {activePlan && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-[#6d28d9]/10 border border-[#6d28d9]/30 rounded-lg">
            <FileText className="w-4 h-4 text-[#a78bfa]" />
            <span className="text-sm text-[#a78bfa]">Using plan: {activePlan.name}</span>
          </div>
        )}

        {/* Tempo Tracker */}
        <div className="mb-4">
          <TempoTracker onComplete={handleTempoComplete} />
        </div>

        {/* Exercises */}
        <Card className="bg-[#0c0c12] border-[#1e1e2e] mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-white">Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((exercise, index) => (
              <div key={index} className="p-3 bg-[#08080c] rounded-lg space-y-3" data-testid={`exercise-${index}`}>
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
                      className="w-full h-9 px-3 bg-[#030304] border border-[#1e1e2e] rounded-md text-white text-sm focus:outline-none focus:border-[#6d28d9]"
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
                      className="bg-[#030304] border-[#1e1e2e] text-white h-9"
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
                      className="bg-[#030304] border-[#1e1e2e] text-white h-9"
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
                      className="bg-[#030304] border-[#1e1e2e] text-white h-9"
                      data-testid={`exercise-reps-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-[#1e1e2e] text-[#71717a] hover:text-white hover:border-[#6d28d9] h-9"
              onClick={addExercise}
              data-testid="add-exercise-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="bg-[#0c0c12] border-[#1e1e2e] mb-4">
          <CardContent className="pt-4">
            <Label className="text-xs text-[#71717a]">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full mt-1.5 p-3 bg-[#08080c] border border-[#1e1e2e] rounded-lg text-white placeholder:text-[#71717a] text-sm focus:outline-none focus:border-[#6d28d9] min-h-[80px] resize-none"
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
