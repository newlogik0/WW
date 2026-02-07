import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History as HistoryIcon, 
  ArrowLeft, 
  Dumbbell,
  Flame,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function History() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

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

  const startEditing = (workout) => {
    setEditingId(workout.id);
    setEditNotes(workout.details?.notes || "");
  };

  const saveEdit = async (workoutId) => {
    try {
      await api.put(`/workouts/${workoutId}`, {
        details: {
          ...workouts.find(w => w.id === workoutId)?.details,
          notes: editNotes
        }
      });
      toast.success("Session notes updated!");
      setEditingId(null);
      await loadWorkouts();
    } catch (error) {
      toast.error("Failed to update notes");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
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
      <div className="min-h-screen bg-[#0d0d0d]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="history-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-[#b3b3b3] hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center">
            <HistoryIcon className="w-6 h-6 text-[#00d9ff]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Workout History</h1>
            <p className="text-[#b3b3b3] text-sm">Your training journal</p>
          </div>
        </div>

        {workouts.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-[#808080] mx-auto mb-4" />
              <p className="text-[#b3b3b3] text-lg mb-4">No workouts logged yet</p>
              <Button
                onClick={() => navigate("/workout")}
                className="bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold"
              >
                Start Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#808080]" />
                  <h2 className="text-[#b3b3b3] font-medium text-sm">{date}</h2>
                </div>
                
                <div className="space-y-3">
                  {dayWorkouts.map((workout) => (
                    <Card 
                      key={workout.id}
                      className="bg-[#1a1a1a] border-[#333333] hover:border-[#00d9ff]/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(workout.id)}
                      data-testid={`workout-${workout.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                            workout.workout_type === 'weightlifting' 
                              ? 'bg-[#ff4444]/10' 
                              : 'bg-[#4d94ff]/10'
                          }`}>
                            {workout.workout_type === 'weightlifting' ? (
                              <Dumbbell className="w-5 h-5 text-[#ff4444]" />
                            ) : (
                              <Flame className="w-5 h-5 text-[#4d94ff]" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium capitalize">
                                {workout.workout_type}
                              </h3>
                              <span className="text-xs text-[#808080]">
                                {new Date(workout.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div className="flex gap-3 text-sm mt-1">
                              <span className="text-[#00d9ff]">+{workout.xp_earned} XP</span>
                              {workout.stats_gained?.strength > 0 && (
                                <span className="text-[#ff4444]">+{workout.stats_gained.strength} STR</span>
                              )}
                              {workout.stats_gained?.endurance > 0 && (
                                <span className="text-[#4d94ff]">+{workout.stats_gained.endurance} END</span>
                              )}
                              {workout.stats_gained?.agility > 0 && (
                                <span className="text-[#00ff88]">+{workout.stats_gained.agility} AGI</span>
                              )}
                            </div>
                          </div>
                          
                          {expandedId === workout.id ? (
                            <ChevronUp className="w-5 h-5 text-[#808080]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#808080]" />
                          )}
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedId === workout.id && (
                          <div className="mt-4 pt-4 border-t border-[#333333]">
                            {/* Session Category Badge */}
                            {workout.session_category && (
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  workout.session_category === 'push' ? 'bg-[#ff4444]/10 text-[#ff4444]' :
                                  workout.session_category === 'pull' ? 'bg-[#4d94ff]/10 text-[#4d94ff]' :
                                  workout.session_category === 'legs' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                                  'bg-[#00d9ff]/10 text-[#00d9ff]'
                                }`}>
                                  {workout.session_category.charAt(0).toUpperCase() + workout.session_category.slice(1)} Day
                                </span>
                              </div>
                            )}
                            
                            {workout.workout_type === 'weightlifting' && workout.details?.exercises && (
                              <div className="space-y-2 mb-4">
                                <p className="text-[#b3b3b3] text-sm font-medium">Exercises:</p>
                                {workout.details.exercises.map((ex, i) => (
                                  <div key={i} className="flex justify-between text-sm bg-[#0d0d0d] p-3 rounded border border-[#333333]">
                                    <span className="text-white font-medium">{ex.name}</span>
                                    <div className="text-[#b3b3b3] space-x-3">
                                      <span>{ex.sets} sets</span>
                                      <span>{ex.reps} reps</span>
                                      {ex.useSameWeight ? (
                                        <span className="text-[#00d9ff]">@ {ex.weight}kg</span>
                                      ) : (
                                        <span className="text-[#00d9ff]">@ {ex.weights?.join(', ')}kg</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {workout.workout_type === 'cardio' && workout.details && (
                              <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between bg-[#0d0d0d] p-3 rounded border border-[#333333]">
                                  <span className="text-[#b3b3b3]">Activity:</span>
                                  <span className="text-white capitalize">{workout.details.activity}</span>
                                </div>
                                <div className="flex justify-between bg-[#0d0d0d] p-3 rounded border border-[#333333]">
                                  <span className="text-[#b3b3b3]">Duration:</span>
                                  <span className="text-white">{workout.details.duration_minutes} minutes</span>
                                </div>
                                {workout.details.distance_km && (
                                  <div className="flex justify-between bg-[#0d0d0d] p-3 rounded border border-[#333333]">
                                    <span className="text-[#b3b3b3]">Distance:</span>
                                    <span className="text-white">{workout.details.distance_km} km</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Session Notes */}
                            <div className="mt-3 p-3 bg-[#0d0d0d] rounded border border-[#333333]">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[#b3b3b3] text-sm font-medium">Session Notes:</p>
                                {editingId !== workout.id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing(workout)}
                                    className="h-7 text-xs text-[#00d9ff] hover:text-[#33e0ff]"
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                              
                              {editingId === workout.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Add notes about this session..."
                                    className="w-full p-2 bg-[#1a1a1a] border border-[#333333] rounded text-white text-sm min-h-[80px] resize-none focus:outline-none focus:border-[#00d9ff]"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => saveEdit(workout.id)}
                                      className="h-8 bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold"
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelEdit}
                                      className="h-8 border-[#333333] text-[#b3b3b3]"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-white text-sm">
                                  {workout.details?.notes || "No notes added"}
                                </p>
                              )}
                            </div>
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
