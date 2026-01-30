import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Shield, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success("Welcome back, warrior!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]" data-testid="login-page">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffd700]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md bg-[#12121a]/90 border-[#2a2a3a] backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center gap-2">
            <Sword className="w-8 h-8 text-[#ffd700]" />
            <Shield className="w-8 h-8 text-[#dc2626]" />
          </div>
          <CardTitle className="text-3xl font-cinzel text-[#ffd700]">Training Hero</CardTitle>
          <CardDescription className="text-gray-400">
            Enter the arena and continue your journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1a1a25] border-[#2a2a3a] text-white placeholder:text-gray-500 focus:border-[#ffd700]"
                data-testid="login-email-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a1a25] border-[#2a2a3a] text-white placeholder:text-gray-500 focus:border-[#ffd700]"
                data-testid="login-password-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#ffd700] to-[#b8860b] text-[#0a0a0f] hover:from-[#ffed4a] hover:to-[#ffd700] font-semibold"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entering...
                </>
              ) : (
                "Enter the Arena"
              )}
            </Button>
          </form>
          
          <p className="text-center mt-6 text-gray-400">
            New hero?{" "}
            <Link to="/register" className="text-[#ffd700] hover:underline" data-testid="register-link">
              Create your character
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
