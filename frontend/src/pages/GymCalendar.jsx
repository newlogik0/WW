import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Dumbbell,
  Flame,
  ChevronLeft,
  ChevronRight,
  Trophy
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function GymCalendar() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsRes, statsRes] = await Promise.all([
        api.get("/workouts?limit=365"),
        api.get("/workouts/stats")
      ]);
      setWorkouts(workoutsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load calendar data", error);
    } finally {
      setLoading(false);
    }
  };

  // Get workout dates
  const workoutDates = workouts.reduce((acc, workout) => {
    const date = new Date(workout.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workout);
    return acc;
  }, {});

  // Calendar helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasWorkout = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return workoutDates[date.toDateString()];
  };

  const getWorkoutTypes = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayWorkouts = workoutDates[date.toDateString()] || [];
    const types = { 
      weightlifting: 0, 
      cardio: 0,
      push: 0,
      pull: 0,
      legs: 0,
      full: 0
    };
    dayWorkouts.forEach(w => {
      types[w.workout_type]++;
      if (w.session_category) {
        types[w.session_category]++;
      }
    });
    return types;
  };

  // Calculate streak
  const calculateStreak = () => {
    const sortedDates = Object.keys(workoutDates)
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let date of sortedDates) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - streak);
      expectedDate.setHours(0, 0, 0, 0);
      
      date.setHours(0, 0, 0, 0);
      
      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030304]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#6d28d9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030304]" data-testid="gym-calendar-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
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
            <CalendarIcon className="w-5 h-5 text-[#a78bfa]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Gym Calendar</h1>
            <p className="text-[#68687a] text-sm">Track your training attendance</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#0c0c12] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-[#8b5cf6]" />
                <p className="text-xs text-[#a1a1aa]">Total Days</p>
              </div>
              <p className="text-2xl font-bold text-[#a78bfa]">{Object.keys(workoutDates).length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c12] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-[#8b5cf6]" />
                <p className="text-xs text-[#a1a1aa]">Current Streak</p>
              </div>
              <p className="text-2xl font-bold text-[#a78bfa]">{currentStreak} days</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c12] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-[#ef4444]" />
                <p className="text-xs text-[#a1a1aa]">Push Days</p>
              </div>
              <p className="text-2xl font-bold text-[#ef4444]">{stats?.push_count || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c12] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-[#06b6d4]" />
                <p className="text-xs text-[#a1a1aa]">Pull Days</p>
              </div>
              <p className="text-2xl font-bold text-[#06b6d4]">{stats?.pull_count || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0c0c12] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-[#4ade80]" />
                <p className="text-xs text-[#a1a1aa]">Leg Days</p>
              </div>
              <p className="text-2xl font-bold text-[#4ade80]">{stats?.legs_count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="bg-[#0c0c12] border-[#1e1e2e]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display text-white">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#a8a8b8] hover:text-white hover:bg-[#1a1a28]"
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#a8a8b8] hover:text-white hover:bg-[#1a1a28]"
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-[#68687a] font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map(i => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}
              {days.map(day => {
                const workoutTypes = getWorkoutTypes(day);
                const hasWorkouts = hasWorkout(day);
                const isTodayDate = isToday(day);
                
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all cursor-default ${
                      isTodayDate
                        ? 'bg-[#7c3aed]/20 border-2 border-[#7c3aed]'
                        : hasWorkouts
                        ? 'bg-[#6d28d9]/15 border border-[#6d28d9]/30 hover:bg-[#6d28d9]/25'
                        : 'bg-[#08080c] border border-[#1e1e2e] hover:bg-[#1a1a28]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      isTodayDate
                        ? 'text-[#a78bfa]'
                        : hasWorkouts
                        ? 'text-white'
                        : 'text-[#68687a]'
                    }`}>
                      {day}
                    </span>
                    {hasWorkouts && (
                      <div className="flex gap-1 mt-1 flex-wrap justify-center">
                        {workoutTypes.push > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" title="Push"></div>
                        )}
                        {workoutTypes.pull > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" title="Pull"></div>
                        )}
                        {workoutTypes.legs > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" title="Legs"></div>
                        )}
                        {workoutTypes.full > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" title="Full Body"></div>
                        )}
                        {workoutTypes.cardio > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" title="Cardio"></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[#1e1e2e]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <span className="text-xs text-[#a1a1aa]">Weightlifting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>
                <span className="text-xs text-[#a1a1aa]">Cardio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-lg bg-[#7c3aed]/20 border-2 border-[#7c3aed]"></div>
                <span className="text-xs text-[#a1a1aa]">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
