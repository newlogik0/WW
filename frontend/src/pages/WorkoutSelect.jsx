import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function WorkoutSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="workout-select-page">
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
        
        <h1 className="text-2xl font-semibold text-white mb-8 text-center">
          Choose Your Training
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weightlifting Card */}
          <Card 
            className="bg-[#1a1a1a] border-[#333333] hover:border-[#ff4444]/50 transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="select-weightlifting"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff4444]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative">
              <div className="w-16 h-16 rounded-xl bg-[#ff4444]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-8 h-8 text-[#ff4444]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Weightlifting</h2>
              <p className="text-[#b3b3b3] text-sm mb-5">
                Build raw strength and power. Track exercises, sets, reps, and use the tempo tracker for perfect form.
              </p>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#ff4444]"></div>
                  <span className="text-[#b3b3b3]">Gains: <span className="text-[#ff4444]">Strength</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                  <span className="text-[#b3b3b3]">Bonus: <span className="text-[#00ff88]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#ff4444] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Cardio Card */}
          <Card 
            className="bg-[#1a1a1a] border-[#333333] hover:border-[#4d94ff]/50 transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/cardio")}
            data-testid="select-cardio"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4d94ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative">
              <div className="w-16 h-16 rounded-xl bg-[#4d94ff]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Flame className="w-8 h-8 text-[#4d94ff]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Cardio</h2>
              <p className="text-[#b3b3b3] text-sm mb-5">
                Push your limits and build endurance. Log running, cycling, swimming, and more.
              </p>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#4d94ff]"></div>
                  <span className="text-[#b3b3b3]">Gains: <span className="text-[#4d94ff]">Endurance</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                  <span className="text-[#b3b3b3]">Bonus: <span className="text-[#00ff88]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#4d94ff] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-4 h-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
