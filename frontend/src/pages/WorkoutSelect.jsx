import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function WorkoutSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204]" data-testid="workout-select-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="text-[#a8a8b8] hover:text-white mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-display text-[#a78bfa] mb-8 text-center font-bold">
          Choose Your Training
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Weightlifting Card */}
          <Card 
            className="bg-gradient-to-br from-[#0c0c12] to-[#14141e] border-[#1e1e2e] hover:border-[#ef4444] transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="select-weightlifting"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ef4444]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-[#ef4444]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-10 h-10 text-[#ef4444]" />
              </div>
              <h2 className="text-2xl font-display text-white mb-3">Weightlifting</h2>
              <p className="text-[#a1a1aa] mb-6">
                Build raw strength and power. Track exercises, sets, reps, and use the tempo tracker for perfect form.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                  <span className="text-[#d4d4d8]">Gains: <span className="text-[#ef4444]">Strength</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
                  <span className="text-[#d4d4d8]">Bonus: <span className="text-[#4ade80]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#ef4444] font-semibold group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Cardio Card */}
          <Card 
            className="bg-gradient-to-br from-[#0c0c12] to-[#14141e] border-[#1e1e2e] hover:border-[#06b6d4] transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/cardio")}
            data-testid="select-cardio"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-[#06b6d4]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-10 h-10 text-[#06b6d4]" />
              </div>
              <h2 className="text-2xl font-display text-white mb-3">Cardio</h2>
              <p className="text-[#a1a1aa] mb-6">
                Push your limits and build endurance. Log running, cycling, swimming, and more.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div>
                  <span className="text-[#d4d4d8]">Gains: <span className="text-[#06b6d4]">Endurance</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
                  <span className="text-[#d4d4d8]">Bonus: <span className="text-[#4ade80]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#06b6d4] font-semibold group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
