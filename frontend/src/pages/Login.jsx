import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Dumbbell, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0f1420] flex items-center justify-center p-4 relative overflow-hidden" data-testid="login-page">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#ffd700]/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00d4ff]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#ffd700] via-[#ff8800] to-[#ffd700] flex items-center justify-center shadow-2xl relative" style={{ boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)' }}>
            <Dumbbell className="w-12 h-12 text-[#0a0e1a]" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00ff88] rounded-full flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 text-[#0a0e1a]" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-black bg-gradient-to-r from-[#ffd700] via-[#ffe44d] to-[#ffd700] bg-clip-text text-transparent mb-2">
            Warrior's Way
          </h1>
          <p className="text-[#a0aec0] font-medium">Level up your fitness journey</p>
        </div>

        {/* Login Card */}
        <Card className="bg-gradient-to-br from-[#1a2332]/95 to-[#121826]/95 border-2 border-[#ffd700]/30 backdrop-blur-xl shadow-2xl" style={{ boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.15)' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-display font-bold text-center bg-gradient-to-r from-[#ffffff] to-[#a0aec0] bg-clip-text text-transparent">
              Enter the Arena
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-2 border-[#00d4ff]/30 bg-[#00d4ff]/10 text-white hover:bg-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all font-semibold"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{ boxShadow: '0 4px 20px rgba(0, 212, 255, 0.2)' }}
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#2a3442] to-transparent"></div>
            <span className="text-[#68687a] text-sm font-medium">or</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#2a3442] to-transparent"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[#a0aec0] text-sm font-semibold">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="warrior_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#0a0e1a]/50 border-[#2a3442] text-white placeholder:text-[#68687a] focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 h-12 font-medium"
                data-testid="login-username-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#a0aec0] text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0a0e1a]/50 border-[#2a3442] text-white placeholder:text-[#68687a] focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd700]/20 h-12 font-medium"
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#ffd700] via-[#ff8800] to-[#ffd700] hover:from-[#ffe44d] hover:via-[#ffa500] hover:to-[#ffe44d] text-[#0a0e1a] font-display font-black text-base shadow-lg transition-all"
              style={{ boxShadow: '0 4px 25px rgba(255, 215, 0, 0.4)' }}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Enter the Arena
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-[#2a3442]">
            <p className="text-[#a0aec0] text-sm">
              New warrior?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[#ffd700] hover:text-[#ffe44d] font-bold transition-colors"
                data-testid="register-link"
              >
                Join the Quest
              </button>
            </p>
          </div>
          </CardContent>
        </Card>

        <p className="text-center text-[#68687a] text-xs mt-6">
          © 2024 Warrior's Way. Train hard, level up.
        </p>
      </div>
    </div>
  );
}
