import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

const GOOGLE_OAUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/login";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      handleGoogleCallback(sessionId);
    }
  }, [searchParams]);

  const handleGoogleCallback = async (sessionId) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(sessionId);
      toast.success("Welcome, warrior!");
      navigate("/");
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(username, password);
      toast.success("Welcome back, warrior!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const currentUrl = window.location.origin + "/login";
    window.location.href = `${GOOGLE_OAUTH_URL}?redirect_uri=${encodeURIComponent(currentUrl)}`;
  };

  if (googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020204]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#a78bfa]">Signing in with Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020204]" data-testid="login-page">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#4c1d95]/10 rounded-full blur-[150px]"></div>
      </div>
      
      <Card className="w-full max-w-sm bg-[#0a0a10]/95 border-[#1a1a28] backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 animate-float">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-display font-bold text-white">Warrior's Way</CardTitle>
            <CardDescription className="text-[#68687a] mt-1">
              Enter the arena
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button 
            type="button"
            variant="outline"
            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-medium"
            onClick={handleGoogleLogin}
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1a1a28]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0a0a10] text-[#68687a]">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[#a8a8b8] text-sm">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="warrior_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#06060a] border-[#1a1a28] text-white placeholder:text-[#68687a] focus:border-[#7c3aed] h-11"
                data-testid="login-username-input"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#a8a8b8] text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#06060a] border-[#1a1a28] text-white placeholder:text-[#68687a] focus:border-[#7c3aed] h-11"
                data-testid="login-password-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white hover:from-[#8b5cf6] hover:to-[#6d28d9] font-semibold"
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
          
          <p className="text-center text-[#68687a] text-sm">
            New warrior?{" "}
            <Link to="/register" className="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors" data-testid="register-link">
              Begin your journey
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
