import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function WorkoutSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f]" data-testid="workout-select-page">
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
        
        <h1 className="text-3xl font-cinzel text-[#ffd700] mb-8 text-center">
          Choose Your Training
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Weightlifting Card */}
          <Card 
            className="bg-gradient-to-br from-[#12121a] to-[#1a1a25] border-[#2a2a3a] hover:border-[#dc2626] transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/weightlifting")}
            data-testid="select-weightlifting"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-[#dc2626]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-10 h-10 text-[#dc2626]" />
              </div>
              <h2 className="text-2xl font-cinzel text-white mb-3">Weightlifting</h2>
              <p className="text-gray-400 mb-6">
                Build raw strength and power. Track exercises, sets, reps, and use the tempo tracker for perfect form.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#dc2626]"></div>
                  <span className="text-gray-300">Gains: <span className="text-[#dc2626]">Strength</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                  <span className="text-gray-300">Bonus: <span className="text-[#22c55e]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#dc2626] font-semibold group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </CardContent>
          </Card>

          {/* Cardio Card */}
          <Card 
            className="bg-gradient-to-br from-[#12121a] to-[#1a1a25] border-[#2a2a3a] hover:border-[#22d3d3] transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => navigate("/workout/cardio")}
            data-testid="select-cardio"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#22d3d3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-8 relative">
              <div className="w-20 h-20 rounded-2xl bg-[#22d3d3]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-10 h-10 text-[#22d3d3]" />
              </div>
              <h2 className="text-2xl font-cinzel text-white mb-3">Cardio</h2>
              <p className="text-gray-400 mb-6">
                Push your limits and build endurance. Log running, cycling, swimming, and more.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#22d3d3]"></div>
                  <span className="text-gray-300">Gains: <span className="text-[#22d3d3]">Endurance</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                  <span className="text-gray-300">Bonus: <span className="text-[#22c55e]">Agility</span></span>
                </div>
              </div>
              <div className="flex items-center text-[#22d3d3] font-semibold group-hover:translate-x-2 transition-transform">
                Start Training <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
