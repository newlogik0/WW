import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History as HistoryIcon, 
  ArrowLeft, 
  Dumbbell,
  Flame,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function History() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await api.get("/workouts?limit=50");
      setWorkouts(response.data);
    } catch (error) {
      console.error("Failed to load workouts", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group workouts by date
  const groupedWorkouts = workouts.reduce((groups, workout) => {
    const date = new Date(workout.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="history-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#ffd700]/20 flex items-center justify-center">
            <HistoryIcon className="w-7 h-7 text-[#ffd700]" />
          </div>
          <div>
            <h1 className="text-2xl font-cinzel text-[#ffd700]">Workout History</h1>
            <p className="text-gray-400">Your training journal</p>
          </div>
        </div>

        {workouts.length === 0 ? (
          <Card className="bg-[#12121a] border-[#2a2a3a]">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No workouts logged yet</p>
              <Button
                onClick={() => navigate("/workout")}
                className="bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-[#0a0a0f]"
              >
                Start Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h2 className="text-gray-400 font-medium">{date}</h2>
                </div>
                
                <div className="space-y-3">
                  {dayWorkouts.map((workout) => (
                    <Card 
                      key={workout.id}
                      className="bg-[#12121a] border-[#2a2a3a] hover:border-[#ffd700]/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(workout.id)}
                      data-testid={`workout-${workout.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            workout.workout_type === 'weightlifting' 
                              ? 'bg-[#dc2626]/20' 
                              : 'bg-[#22d3d3]/20'
                          }`}>
                            {workout.workout_type === 'weightlifting' ? (
                              <Dumbbell className="w-6 h-6 text-[#dc2626]" />
                            ) : (
                              <Flame className="w-6 h-6 text-[#22d3d3]" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium capitalize">
                                {workout.workout_type}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {new Date(workout.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div className="flex gap-3 text-sm mt-1">
                              <span className="text-[#ffd700]">+{workout.xp_earned} XP</span>
                              {workout.stats_gained?.strength > 0 && (
                                <span className="text-[#dc2626]">+{workout.stats_gained.strength} STR</span>
                              )}
                              {workout.stats_gained?.endurance > 0 && (
                                <span className="text-[#22d3d3]">+{workout.stats_gained.endurance} END</span>
                              )}
                              {workout.stats_gained?.agility > 0 && (
                                <span className="text-[#22c55e]">+{workout.stats_gained.agility} AGI</span>
                              )}
                            </div>
                          </div>
                          
                          {expandedId === workout.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedId === workout.id && (
                          <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                            {workout.workout_type === 'weightlifting' && workout.details?.exercises && (
                              <div className="space-y-2">
                                <p className="text-gray-400 text-sm font-medium">Exercises:</p>
                                {workout.details.exercises.map((ex, i) => (
                                  <div key={i} className="flex justify-between text-sm bg-[#1a1a25] p-2 rounded">
                                    <span className="text-white">{ex.name}</span>
                                    <span className="text-gray-400">
                                      {ex.sets} × {ex.reps} @ {ex.weight}kg
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {workout.workout_type === 'cardio' && workout.details && (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Activity:</span>
                                  <span className="text-white capitalize">{workout.details.activity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Duration:</span>
                                  <span className="text-white">{workout.details.duration_minutes} minutes</span>
                                </div>
                                {workout.details.distance_km && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Distance:</span>
                                    <span className="text-white">{workout.details.distance_km} km</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {workout.details?.notes && (
                              <div className="mt-3 p-2 bg-[#1a1a25] rounded text-sm">
                                <p className="text-gray-400">Notes:</p>
                                <p className="text-gray-300">{workout.details.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
