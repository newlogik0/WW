import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  User, 
  ArrowLeft, 
  Sword,
  Heart,
  Zap,
  Trophy,
  Calendar,
  LogOut,
  ScanFace,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FaceAuth from "@/components/FaceAuth";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, registerFace } = useAuth();
  const [showFaceRegister, setShowFaceRegister] = useState(false);
  const [registeringFace, setRegisteringFace] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFaceRegister = async (faceDescriptor) => {
    setRegisteringFace(true);
    try {
      await registerFace(faceDescriptor);
      toast.success("Face registered successfully! You can now login with your face.");
      setShowFaceRegister(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to register face");
    } finally {
      setRegisteringFace(false);
    }
  };

  const xpProgress = user ? (user.xp / user.xp_to_next_level) * 100 : 0;
  const totalStats = user ? user.strength + user.endurance + user.agility : 0;

  return (
    <div className="min-h-screen bg-[#0d0d0d]" data-testid="profile-page">
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
        
        {/* Profile Header */}
        <Card className="bg-[#1a1a1a] border-[#333333] mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-[#262626] border-2 border-[#00d9ff]/30 flex items-center justify-center">
                  <User className="w-14 h-14 text-[#00d9ff]" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#0d0d0d] border-2 border-[#00d9ff] flex items-center justify-center">
                  <span className="text-[#00d9ff] font-bold text-lg">{user?.level}</span>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-white mb-2" data-testid="profile-username">
                  {user?.username}
                </h1>
                <p className="text-[#b3b3b3] mb-1">{user?.email}</p>
                <p className="text-[#808080] text-sm flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </p>
                
                {/* XP Bar */}
                <div className="max-w-md mx-auto md:mx-0 mt-6">
                  <div className="flex justify-between text-sm text-[#b3b3b3] mb-2">
                    <span>Level {user?.level}</span>
                    <span>{user?.xp} / {user?.xp_to_next_level} XP</span>
                  </div>
                  <div className="xp-bar">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#ff4444]/10 border border-[#ff4444]/20 flex items-center justify-center">
                  <Sword className="w-6 h-6 text-[#ff4444]" />
                </div>
                <div>
                  <p className="text-[#808080] text-sm">Strength</p>
                  <p className="text-2xl font-bold text-[#ff4444]" data-testid="profile-strength">
                    {user?.strength}
                  </p>
                </div>
              </div>
              <p className="text-[#808080] text-xs mt-3">
                Increased by weightlifting
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#4d94ff]/10 border border-[#4d94ff]/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#4d94ff]" />
                </div>
                <div>
                  <p className="text-[#808080] text-sm">Endurance</p>
                  <p className="text-2xl font-bold text-[#4d94ff]" data-testid="profile-endurance">
                    {user?.endurance}
                  </p>
                </div>
              </div>
              <p className="text-[#808080] text-xs mt-3">
                Increased by cardio
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a1a1a] border-[#333333]">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-[#808080] text-sm">Agility</p>
                  <p className="text-2xl font-bold text-[#00ff88]" data-testid="profile-agility">
                    {user?.agility}
                  </p>
                </div>
              </div>
              <p className="text-[#808080] text-xs mt-3">
                Increased by varied training
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="bg-[#1a1a1a] border-[#333333] mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00d9ff]" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#0d0d0d] rounded-lg border border-[#333333]">
                <p className="text-2xl font-bold text-[#00d9ff]">{user?.total_workouts}</p>
                <p className="text-[#808080] text-sm">Total Workouts</p>
              </div>
              <div className="text-center p-4 bg-[#0d0d0d] rounded-lg border border-[#333333]">
                <p className="text-2xl font-bold text-[#00d9ff]">{user?.level}</p>
                <p className="text-[#808080] text-sm">Level</p>
              </div>
              <div className="text-center p-4 bg-[#0d0d0d] rounded-lg border border-[#333333]">
                <p className="text-2xl font-bold text-[#00d9ff]">{totalStats}</p>
                <p className="text-[#808080] text-sm">Total Stats</p>
              </div>
              <div className="text-center p-4 bg-[#0d0d0d] rounded-lg border border-[#333333]">
                <p className="text-2xl font-bold text-[#00d9ff]">{user?.xp}</p>
                <p className="text-[#808080] text-sm">Current XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Face Registration Section */}
        <Card className="bg-[#1a1a1a] border-[#333333] mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-[#00d9ff]" />
              Face Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showFaceRegister ? (
              <FaceAuth 
                mode="register"
                onSuccess={handleFaceRegister}
                onCancel={() => setShowFaceRegister(false)}
              />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="text-[#b3b3b3] text-sm mb-2">
                    {user?.hasFaceRegistered 
                      ? "Your face is registered. You can update it anytime."
                      : "Register your face to enable quick login without password."
                    }
                  </p>
                  {user?.hasFaceRegistered && (
                    <div className="flex items-center gap-2 text-[#00ff88] text-sm">
                      <Check className="w-4 h-4" />
                      Face ID Enabled
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowFaceRegister(true)}
                  className="bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold"
                  data-testid="register-face-btn"
                >
                  <ScanFace className="w-4 h-4 mr-2" />
                  {user?.hasFaceRegistered ? "Update Face ID" : "Register Face ID"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
