import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  ArrowLeft, 
  FileText,
  Image,
  Loader2,
  Trash2,
  Plus,
  Check,
  Edit2,
  X
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function TrainingPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get("/plans");
      setPlans(response.data);
    } catch (error) {
      console.error("Failed to load plans", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'text/plain'];
    
    // Check file extension for txt files
    const fileName = file.name.toLowerCase();
    const isTextFile = fileName.endsWith('.txt');
    
    if (!allowedTypes.includes(file.type) && !isTextFile) {
      toast.error("Please upload a PDF, image, or text file");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post("/plans/import", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(
        <div>
          <p className="font-semibold">Plan Imported!</p>
          <p className="text-sm">{response.data.plan.exercises.length} exercises extracted</p>
        </div>
      );
      
      await loadPlans();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to import plan");
    } finally {
      setUploading(false);
    }
  };

  const setActivePlan = async (planId) => {
    try {
      await api.put(`/plans/${planId}`, { is_active: true });
      toast.success("Plan activated!");
      await loadPlans();
    } catch (error) {
      toast.error("Failed to activate plan");
    }
  };

  const deletePlan = async (planId) => {
    try {
      await api.delete(`/plans/${planId}`);
      toast.success("Plan deleted");
      await loadPlans();
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  const startEditing = (plan) => {
    setEditingPlan({
      ...plan,
      exercises: [...plan.exercises]
    });
  };

  const saveEdit = async () => {
    if (!editingPlan) return;
    
    try {
      await api.put(`/plans/${editingPlan.id}`, {
        name: editingPlan.name,
        exercises: editingPlan.exercises
      });
      toast.success("Plan updated!");
      setEditingPlan(null);
      await loadPlans();
    } catch (error) {
      toast.error("Failed to update plan");
    }
  };

  const updateExercise = (index, field, value) => {
    if (!editingPlan) return;
    const updated = { ...editingPlan };
    updated.exercises[index][field] = value;
    setEditingPlan(updated);
  };

  const addExercise = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      exercises: [...editingPlan.exercises, { name: "", sets: 3, reps: 10, weight: 0 }]
    });
  };

  const removeExercise = (index) => {
    if (!editingPlan || editingPlan.exercises.length <= 1) return;
    setEditingPlan({
      ...editingPlan,
      exercises: editingPlan.exercises.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b]" data-testid="plans-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="text-[#a1a1aa] hover:text-white mb-4 h-8 px-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#8b5cf6]/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Training Plans</h1>
            <p className="text-[#71717a] text-sm">Import and manage your workout plans</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`import-zone mb-6 ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="import-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-[#6d28d9] animate-spin mb-3" />
              <p className="text-white font-medium">Analyzing your plan...</p>
              <p className="text-[#71717a] text-sm">AI is extracting exercises</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#6d28d9]/15 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#8b5cf6]" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#6d28d9]/15 flex items-center justify-center">
                  <Image className="w-7 h-7 text-[#8b5cf6]" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#6d28d9]/15 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#8b5cf6]" />
                </div>
              </div>
              <p className="text-white font-medium mb-1">Drop your training plan here</p>
              <p className="text-[#71717a] text-sm">PDF, Images, or Text files supported</p>
            </>
          )}
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          <h2 className="text-sm font-display text-[#a1a1aa]">Your Plans ({plans.length})</h2>
          
          {plans.length === 0 ? (
            <Card className="bg-[#1c1c21] border-[#2e2e33]">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-[#71717a] mx-auto mb-3" />
                <p className="text-[#a1a1aa]">No training plans yet</p>
                <p className="text-[#71717a] text-sm">Upload a PDF or photo of your workout plan</p>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-[#1c1c21] border-[#2e2e33] ${plan.is_active ? 'border-[#d4af37]/50' : ''}`}
                data-testid={`plan-${plan.id}`}
              >
                {editingPlan?.id === plan.id ? (
                  /* Editing Mode */
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <Input
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="bg-[#18181b] border-[#2e2e33] text-white max-w-xs"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="bg-[#10b981] hover:bg-[#059669]">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingPlan(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {editingPlan.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-[#18181b] rounded-lg">
                          <Input
                            value={ex.name}
                            onChange={(e) => updateExercise(i, 'name', e.target.value)}
                            placeholder="Exercise name"
                            className="bg-[#09090b] border-[#2e2e33] text-white flex-1 h-8 text-sm"
                          />
                          <Input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))}
                            className="bg-[#09090b] border-[#2e2e33] text-white w-16 h-8 text-sm"
                            placeholder="Sets"
                          />
                          <Input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))}
                            className="bg-[#09090b] border-[#2e2e33] text-white w-16 h-8 text-sm"
                            placeholder="Reps"
                          />
                          <Input
                            type="number"
                            value={ex.weight || 0}
                            onChange={(e) => updateExercise(i, 'weight', Number(e.target.value))}
                            className="bg-[#09090b] border-[#2e2e33] text-white w-20 h-8 text-sm"
                            placeholder="kg"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-[#ef4444]"
                            onClick={() => removeExercise(i)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed border-[#2e2e33] text-[#71717a]"
                        onClick={addExercise}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Exercise
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  /* View Mode */
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{plan.name}</h3>
                          {plan.is_active && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[#71717a] text-sm">{plan.exercises?.length || 0} exercises</p>
                      </div>
                      <div className="flex gap-2">
                        {!plan.is_active && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 h-8"
                            onClick={() => setActivePlan(plan.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => startEditing(plan)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#ef4444]"
                          onClick={() => deletePlan(plan.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {plan.exercises?.slice(0, 6).map((ex, i) => (
                        <div key={i} className="p-2 bg-[#18181b] rounded text-sm">
                          <p className="text-white truncate">{ex.name}</p>
                          <p className="text-[#71717a] text-xs">{ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}</p>
                        </div>
                      ))}
                      {plan.exercises?.length > 6 && (
                        <div className="p-2 bg-[#18181b] rounded text-sm flex items-center justify-center">
                          <p className="text-[#71717a]">+{plan.exercises.length - 6} more</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
