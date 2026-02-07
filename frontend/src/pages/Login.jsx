import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, api } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Loader2, Dumbbell, Zap, ScanFace } from "lucide-react";
import FaceAuth from "@/components/FaceAuth";

const GOOGLE_OAUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/login";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [faceLoginLoading, setFaceLoginLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFace } = useAuth();
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
      await login(username, password, rememberMe);
      toast.success("Welcome back, warrior!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async (faceDescriptor) => {
    setFaceLoginLoading(true);
    try {
      await loginWithFace(faceDescriptor);
      toast.success("Welcome back, warrior!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Face not recognized. Please try password login.");
    } finally {
      setFaceLoginLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const currentUrl = window.location.origin + "/login";
    window.location.href = `${GOOGLE_OAUTH_URL}?redirect_uri=${encodeURIComponent(currentUrl)}`;
  };

  if (googleLoading || faceLoginLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020204]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#00d9ff]">
            {faceLoginLoading ? "Authenticating with face..." : "Signing in with Google..."}
          </p>
        </div>
      </div>
    );
  }

  // Show Face Login UI
  if (showFaceLogin) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4" data-testid="login-page">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-[#00d9ff]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">Warrior's Way</h1>
          </div>
          
          <FaceAuth 
            mode="login"
            onSuccess={handleFaceLogin}
            onCancel={() => setShowFaceLogin(false)}
          />
          
          <p className="text-center text-[#808080] text-xs mt-6">
            © 2024 Warrior's Way
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#00d9ff]/10 border border-[#00d9ff]/20 flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-[#00d9ff]" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Warrior's Way
          </h1>
          <p className="text-[#b3b3b3] text-sm">Track your fitness journey</p>
        </div>

        {/* Login Card */}
        <Card className="card-elevated">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-center text-white">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-[#333333] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:border-[#00d9ff]/30 transition-all text-sm"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            <div className="flex-1 h-[1px] bg-[#333333]"></div>
            <span className="text-[#808080] text-xs">or</span>
            <div className="flex-1 h-[1px] bg-[#333333]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm text-[#b3b3b3] font-medium">Username or Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="warrior_name or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#1a1a1a] border-[#333333] text-white placeholder:text-[#808080] focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] h-10 text-sm"
                data-testid="login-username-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-[#b3b3b3] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a1a1a] border-[#333333] text-white placeholder:text-[#808080] focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff] h-10 text-sm"
                data-testid="login-password-input"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
                className="border-[#333333] data-[state=checked]:bg-[#00d9ff] data-[state=checked]:border-[#00d9ff]"
                data-testid="remember-me-checkbox"
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm text-[#b3b3b3] cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold text-sm transition-all"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Face Login Option */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-[#333333]"></div>
            <span className="text-[#808080] text-xs">or</span>
            <div className="flex-1 h-[1px] bg-[#333333]"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 border-[#333333] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:border-[#00d9ff]/30 transition-all text-sm"
            onClick={() => setShowFaceLogin(true)}
            data-testid="face-login-btn"
          >
            <ScanFace className="w-4 h-4 mr-2" />
            Login with Face Recognition
          </Button>

          <div className="text-center pt-4 border-t border-[#333333]">
            <p className="text-sm text-[#b3b3b3]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[#00d9ff] hover:text-[#33e0ff] font-semibold transition-colors"
                data-testid="register-link"
              >
                Sign Up
              </button>
            </p>
          </div>
          </CardContent>
        </Card>

        <p className="text-center text-[#808080] text-xs mt-6">
          © 2024 Warrior's Way
        </p>
      </div>
    </div>
  );
}
