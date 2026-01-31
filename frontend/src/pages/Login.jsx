import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030304]" data-testid="login-page">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#6d28d9]/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#4c1d95]/8 rounded-full blur-[120px]"></div>
      </div>
      
      <Card className="w-full max-w-sm bg-[#0c0c12]/90 border-[#1e1e2e] backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#4c1d95] flex items-center justify-center shadow-lg shadow-[#6d28d9]/25">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold text-white">Warrior's Way</CardTitle>
          <CardDescription className="text-[#71717a]">
            Enter the arena and continue your journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#a1a1aa] text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="warrior@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#08080c] border-[#1e1e2e] text-white placeholder:text-[#71717a] focus:border-[#6d28d9] h-10"
                data-testid="login-email-input"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#a1a1aa] text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#08080c] border-[#1e1e2e] text-white placeholder:text-[#71717a] focus:border-[#6d28d9] h-10"
                data-testid="login-password-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#6d28d9] to-[#4c1d95] text-white hover:from-[#7c3aed] hover:to-[#6d28d9] font-semibold h-10"
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
          
          <p className="text-center mt-5 text-[#71717a] text-sm">
            New warrior?{" "}
            <Link to="/register" className="text-[#a78bfa] hover:text-[#c4b5fd] hover:underline" data-testid="register-link">
              Begin your journey
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
