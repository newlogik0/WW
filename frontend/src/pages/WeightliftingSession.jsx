import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  FileText,
  Volume2,
  VolumeX
} from "lucide-react";
import Navbar from "@/components/Navbar";

const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
  "Bicep Curl", "Tricep Extension", "Lat Pulldown", "Leg Press", "Lunges",
  "Pull Up", "Push Up", "Dumbbell Fly", "Shoulder Press", "Romanian Deadlift",
  "Incline Bench Press", "Cable Fly", "Leg Curl", "Leg Extension", "Calf Raise"
];

// Rest Timer Component
const RestTimer = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // Default 90 seconds
  const [restDuration, setRestDuration] = useState(90);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onComplete) onComplete();
            // Play notification sound
            playTone(1200, 500, 0.4);
            toast.success("Rest complete! Ready for next set");
            return restDuration; // Reset to rest duration
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, restDuration, onComplete]);

  const startRest = () => {
    setTimeLeft(restDuration);
    setIsRunning(true);
    toast.info(`Rest timer started: ${restDuration}s`);
  };

  const stopRest = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetRest = () => {
    setIsRunning(false);
    setTimeLeft(restDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (newDuration) => {
    setRestDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
  };

  const progress = ((restDuration - timeLeft) / restDuration) * 100;

  return (
    <Card className="bg-[#0a0a10] border-[#1a1a28]">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#ef4444]" />
            Rest Timer Between Sets
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Rest Duration Selector */}
          <div>
            <Label className="text-xs text-[#68687a] mb-2 block">Rest Duration (seconds)</Label>
            <div className="flex gap-2">
              {[60, 90, 120, 180].map(duration => (
                <Button
                  key={duration}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(duration)}
                  disabled={isRunning}
                  className={`h-8 ${
                    restDuration === duration
                      ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                      : "border-[#1a1a28] text-[#68687a] hover:border-[#ef4444]/50"
                  }`}
                >
                  {duration}s
                </Button>
              ))}
              <Input
                type="number"
                min="10"
                max="600"
                value={restDuration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                disabled={isRunning}
                className="w-20 h-8 bg-[#06060a] border-[#1a1a28] text-white text-center"
              />
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-5xl font-display font-bold mb-2 ${
              isRunning 
                ? timeLeft <= 10 ? "text-[#ef4444] animate-pulse" : "text-[#ef4444]"
                : "text-[#68687a]"
            }`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#06060a] rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-[#68687a]">
              {isRunning ? "Resting..." : "Click Start to begin rest timer"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button
                onClick={startRest}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Rest
              </Button>
            ) : (
              <>
                <Button 
                  onClick={stopRest}
                  variant="outline"
                  className="border-[#1a1a28] text-[#a8a8b8] hover:bg-[#1a1a28] h-9"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={resetRest}
                  variant="outline"
                  className="border-[#1a1a28] text-[#a8a8b8] hover:bg-[#1a1a28] h-9"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Speech synthesis for voice guidance
const speak = (text, rate = 1.2) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

// Audio beep generator
const playTone = (frequency = 800, duration = 100, volume = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, duration);
  } catch (e) {}
};

// Sound-Guided Tempo Tracker Component
const TempoTracker = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [timer, setTimer] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Default: 1s lower, 2s hold, 1s lift
  const [eccentricTime, setEccentricTime] = useState(1);
  const [holdTime, setHoldTime] = useState(2);
  const [concentricTime, setConcentricTime] = useState(1);
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(phase);
  const timerRef = useRef(timer);

  useEffect(() => {
    phaseRef.current = phase;
    timerRef.current = timer;
  }, [phase, timer]);

  const announcePhase = useCallback((phaseName, isRepComplete = false) => {
    if (soundEnabled) {
      if (phaseName === "lower") playTone(600, 150, 0.3);
      else if (phaseName === "hold") playTone(800, 150, 0.3);
      else if (phaseName === "lift") playTone(1000, 150, 0.3);
    }
    
    if (voiceEnabled) {
      if (isRepComplete) {
        speak(`${repCount + 1}`, 1.5);
      } else {
        speak(phaseName, 1.3);
      }
    }
  }, [soundEnabled, voiceEnabled, repCount]);

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
          if (currentPhase === "eccentric") {
            setPhase("hold");
            announcePhase("hold");
            return 0;
          } else if (currentPhase === "hold") {
            setPhase("concentric");
            announcePhase("lift");
            return 0;
          } else if (currentPhase === "concentric") {
            setPhase("eccentric");
            setRepCount(r => {
              announcePhase("lower", true);
              return r + 1;
            });
            return 0;
          }
        }
        
        return newTime;
      });
    }, 50);
  }, [eccentricTime, holdTime, concentricTime, announcePhase, stopTimer]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setPhase("eccentric");
    setTimer(0);
    announcePhase("lower");
    setTimeout(() => runTimer(), 50);
  }, [announcePhase, runTimer]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    if (voiceEnabled) speak("paused", 1.2);
  }, [stopTimer, voiceEnabled]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    stopTimer();
    setPhase("ready");
    setTimer(0);
    setRepCount(0);
  }, [stopTimer]);

  const finishSet = useCallback(() => {
    pauseTimer();
    if (voiceEnabled && repCount > 0) speak(`Set complete. ${repCount} reps.`, 1.0);
    if (onComplete && repCount > 0) onComplete(repCount);
    resetTimer();
  }, [pauseTimer, onComplete, repCount, resetTimer, voiceEnabled]);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    if (voiceEnabled) speak("resume", 1.2);
    runTimer();
  }, [runTimer, voiceEnabled]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const getTimeRemaining = () => {
    let target;
    if (phase === "eccentric") target = eccentricTime;
    else if (phase === "hold") target = holdTime;
    else if (phase === "concentric") target = concentricTime;
    else return "0.0";
    return Math.max(0, target - timer).toFixed(1);
  };

  const handleTimeChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setter(value);
    }
  };

  return (
    <Card className="bg-[#0a0a10] border-[#1a1a28]" data-testid="tempo-tracker">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#a78bfa]" />
            Sound-Guided Rep Counter
            {soundEnabled && <Volume2 className="w-3 h-3 text-[#7c3aed]" />}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-5">
          {/* Sound Controls */}
          <div className="flex items-center justify-between p-3 bg-[#06060a] rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  className="data-[state=checked]:bg-[#7c3aed]"
                />
                <Label className="text-xs text-[#a8a8b8]">Beeps</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                  className="data-[state=checked]:bg-[#7c3aed]"
                />
                <Label className="text-xs text-[#a8a8b8]">Voice</Label>
              </div>
            </div>
            {(soundEnabled || voiceEnabled) && (
              <div className="sound-wave">
                <span></span><span></span><span></span><span></span>
              </div>
            )}
          </div>

          {/* Tempo Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-[#68687a] mb-1 block">Lower (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={eccentricTime}
                onChange={handleTimeChange(setEccentricTime)}
                className="bg-[#06060a] border-[#7c3aed]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#68687a] mb-1 block">Hold (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={holdTime}
                onChange={handleTimeChange(setHoldTime)}
                className="bg-[#06060a] border-[#8b5cf6]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
            <div>
              <Label className="text-xs text-[#68687a] mb-1 block">Lift (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={concentricTime}
                onChange={handleTimeChange(setConcentricTime)}
                className="bg-[#06060a] border-[#a78bfa]/30 text-white text-center h-9 tempo-input"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Visual Rings */}
          <div className="flex justify-center items-center gap-4">
            <div className={`tempo-ring ${phase === 'eccentric' ? 'active tempo-lower' : ''}`}>
              {phase === 'eccentric' ? getTimeRemaining() : eccentricTime}
            </div>
            <div className={`tempo-ring ${phase === 'hold' ? 'active tempo-hold' : ''}`}>
              {phase === 'hold' ? getTimeRemaining() : holdTime}
            </div>
            <div className={`tempo-ring ${phase === 'concentric' ? 'active tempo-lift' : ''}`}>
              {phase === 'concentric' ? getTimeRemaining() : concentricTime}
            </div>
          </div>

          {/* Phase & Reps */}
          <div className="text-center">
            <p className={`text-2xl font-display font-bold ${
              phase === 'ready' ? 'text-[#68687a]' : 'text-[#a78bfa]'
            }`}>
              {phase === 'ready' ? 'READY' : phase === 'eccentric' ? 'LOWER' : phase === 'hold' ? 'HOLD' : 'LIFT'}
            </p>
            <p className="text-[#a8a8b8] mt-1">
              Reps: <span className="text-[#c4b5fd] font-bold text-2xl">{repCount}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning && phase === "ready" && (
              <Button
                onClick={startTimer}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                data-testid="tempo-start-btn"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            )}
            {isRunning && (
              <Button onClick={pauseTimer} className="bg-[#5b21b6] hover:bg-[#4c1d95] text-white">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            {!isRunning && phase !== "ready" && (
              <Button onClick={resumeTimer} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            {phase !== "ready" && (
              <>
                <Button onClick={resetTimer} variant="outline" className="border-[#1a1a28] text-[#a8a8b8] hover:bg-[#1a1a28]">
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
    { name: "", sets: 3, reps: "10", weight: 0, tempo: "", weights: [], useSameWeight: true }
  ]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all"); // all, push, pull, legs

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await api.get("/plans/active");
        if (res.data && res.data.exercises?.length > 0) {
          setActivePlan(res.data);
          // Load all exercises initially
          loadExercisesByCategory("all", res.data.exercises);
        }
      } catch (e) {
        console.log("No active plan");
      }
    };
    loadPlan();
  }, []);

  const loadExercisesByCategory = (category, planExercises = null) => {
    const source = planExercises || activePlan?.exercises || [];
    
    if (category === "all") {
      setExercises(source.map(e => ({
        name: e.name || "",
        sets: e.sets || 3,
        reps: String(e.reps || "10"),
        weight: e.weight || 0,
        tempo: e.tempo || "",
        category: e.category || "",
        weights: [],
        useSameWeight: true
      })));
    } else {
      const filtered = source.filter(e => e.category === category);
      if (filtered.length > 0) {
        setExercises(filtered.map(e => ({
          name: e.name || "",
          sets: e.sets || 3,
          reps: String(e.reps || "10"),
          weight: e.weight || 0,
          tempo: e.tempo || "",
          category: e.category || "",
          weights: [],
          useSameWeight: true
        })));
      } else {
        // No exercises in this category, show empty state
        setExercises([{ name: "", sets: 3, reps: "10", weight: 0, tempo: "", weights: [], useSameWeight: true }]);
        toast.info(`No ${category} exercises in your plan`);
      }
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (activePlan) {
      loadExercisesByCategory(category);
    }
  };

  // Count exercises by category
  const getCategoryCounts = () => {
    if (!activePlan) return { push: 0, pull: 0, legs: 0 };
    
    return {
      push: activePlan.exercises.filter(e => e.category === "push").length,
      pull: activePlan.exercises.filter(e => e.category === "pull").length,
      legs: activePlan.exercises.filter(e => e.category === "legs").length
    };
  };

  const categoryCounts = getCategoryCounts();

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "10", weight: 0, tempo: "", weights: [], useSameWeight: true }]);
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    
    if (field === "sets") {
      // When sets change, initialize weights array if needed
      updated[index][field] = value;
      if (!updated[index].useSameWeight && value > 0) {
        const currentWeights = updated[index].weights || [];
        const newWeights = Array(value).fill(0).map((_, i) => currentWeights[i] || updated[index].weight || 0);
        updated[index].weights = newWeights;
      }
    } else if (field === "useSameWeight") {
      updated[index][field] = value;
      if (!value) {
        // Initialize weights array with current weight value
        const sets = updated[index].sets || 3;
        updated[index].weights = Array(sets).fill(updated[index].weight || 0);
      }
    } else {
      updated[index][field] = value;
    }
    
    setExercises(updated);
  };

  const updateSetWeight = (exerciseIndex, setIndex, weight) => {
    const updated = [...exercises];
    if (!updated[exerciseIndex].weights) {
      updated[exerciseIndex].weights = [];
    }
    updated[exerciseIndex].weights[setIndex] = Number(weight);
    setExercises(updated);
  };

  const handleTempoComplete = (reps) => {
    toast.success(`Set completed with ${reps} reps!`);
  };

  const handleSubmit = async () => {
    const validExercises = exercises.filter(e => e.name && e.sets > 0 && e.reps);
    
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
    <div className="min-h-screen bg-[#020204]" data-testid="weightlifting-session-page">
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
          <div className="w-11 h-11 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[#a78bfa]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Weightlifting</h1>
            <p className="text-[#68687a] text-sm">Build strength and earn XP</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-[#7c3aed]/50 text-[#a78bfa] hover:bg-[#7c3aed]/10"
            onClick={() => navigate("/plans")}
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
        </div>

        {activePlan && (
          <>
            <div className="flex items-center gap-2 mb-4 p-3 bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-lg">
              <FileText className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-sm text-[#a78bfa]">Using: {activePlan.name}</span>
            </div>

            {/* Category Filter */}
            <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
              <CardContent className="p-4">
                <Label className="text-xs text-[#68687a] mb-2 block">Filter by Muscle Group</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryChange("all")}
                    className={`h-9 ${
                      selectedCategory === "all"
                        ? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#a78bfa]"
                        : "border-[#1a1a28] text-[#68687a] hover:border-[#8b5cf6]/50"
                    }`}
                  >
                    All ({activePlan.exercises.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryChange("push")}
                    className={`h-9 ${
                      selectedCategory === "push"
                        ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                        : "border-[#1a1a28] text-[#68687a] hover:border-[#ef4444]/50"
                    }`}
                    disabled={categoryCounts.push === 0}
                  >
                    Push ({categoryCounts.push})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryChange("pull")}
                    className={`h-9 ${
                      selectedCategory === "pull"
                        ? "bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]"
                        : "border-[#1a1a28] text-[#68687a] hover:border-[#06b6d4]/50"
                    }`}
                    disabled={categoryCounts.pull === 0}
                  >
                    Pull ({categoryCounts.pull})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryChange("legs")}
                    className={`h-9 ${
                      selectedCategory === "legs"
                        ? "bg-[#4ade80]/20 border-[#4ade80] text-[#4ade80]"
                        : "border-[#1a1a28] text-[#68687a] hover:border-[#4ade80]/50"
                    }`}
                    disabled={categoryCounts.legs === 0}
                  >
                    Legs ({categoryCounts.legs})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="mb-4">
          <RestTimer onComplete={() => toast.info("Ready for next set!")} />
        </div>

        <div className="mb-4">
          <TempoTracker onComplete={handleTempoComplete} />
        </div>

        <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-white">Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((exercise, index) => (
              <div key={index} className="p-3 bg-[#06060a] rounded-lg space-y-3" data-testid={`exercise-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[#68687a] text-xs">Exercise {index + 1}</span>
                  {exercises.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-[#f87171] hover:bg-[#f87171]/10"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#68687a]">Exercise</Label>
                    <select
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                      className="w-full h-9 px-3 bg-[#020204] border border-[#1a1a28] rounded-md text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                      data-testid={`exercise-select-${index}`}
                    >
                      <option value="">Select</option>
                      {COMMON_EXERCISES.map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-[#68687a]">Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, "weight", Number(e.target.value))}
                      className="bg-[#020204] border-[#1a1a28] text-white h-9"
                      data-testid={`exercise-weight-${index}`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#68687a]">Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, "sets", Number(e.target.value))}
                      className="bg-[#020204] border-[#1a1a28] text-white h-9"
                      data-testid={`exercise-sets-${index}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#68687a]">Reps</Label>
                    <Input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, "reps", e.target.value)}
                      placeholder="10 or 8-12"
                      className="bg-[#020204] border-[#1a1a28] text-white h-9"
                      data-testid={`exercise-reps-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-[#1a1a28] text-[#68687a] hover:text-white hover:border-[#7c3aed] h-9"
              onClick={addExercise}
              data-testid="add-exercise-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a10] border-[#1a1a28] mb-4">
          <CardContent className="pt-4">
            <Label className="text-xs text-[#68687a]">Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
              className="w-full mt-1.5 p-3 bg-[#06060a] border border-[#1a1a28] rounded-lg text-white placeholder:text-[#68687a] text-sm focus:outline-none focus:border-[#7c3aed] min-h-[80px] resize-none"
              data-testid="workout-notes"
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#8b5cf6] hover:to-[#6d28d9] text-white font-semibold h-12"
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
