import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckSquare } from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { continueAsGuest, user, loading } = useAuth();
  const navigate = useNavigate();

  // If already signed in (not guest), go to projects
  useEffect(() => {
    if (!loading && user && user.id !== "guest") {
      navigate("/projects");
    }
  }, [loading, user, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const newErrors: { email?: string; password?: string } = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(cleanEmail)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoadingEmail(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Keep this generic to avoid account enumeration
        setErrorMsg("Invalid email or password.");
        return;
      }

      navigate("/projects");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/projects");
  };

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err?.message ?? err);
      setOauthLoading(false);
      setErrorMsg("Could not start Google sign-in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center justify-center mb-8"
        >
          <div className="bg-blue-600 p-3 rounded-xl">
            <CheckSquare className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold text-center mb-2">PMA</h1>
        <p className="text-center text-gray-600 mb-8">
          Log in to manage your projects and tasks
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="you@example.com"
              className="mt-1"
              autoComplete="email"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="Enter your password"
              className="mt-1"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <Button type="submit" className="w-full" disabled={loadingEmail}>
            {loadingEmail ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center text-sm mb-6"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={oauthLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M46.5 24.5c0-1.7-.2-3.3-.5-4.9H24v9.3h12.6c-.5 2.7-2 5-4.3 6.6v6h6.9c4-3.7 6.3-9.2 6.3-17z"
                fill="#4285F4"
              />
              <path
                d="M24 47c5.7 0 10.5-1.9 14-5.1l-6.9-6c-1.9 1.3-4.3 2.1-7.1 2.1-5.5 0-10.1-3.7-11.8-8.7H5.1v6.2C8.6 42.1 15.7 47 24 47z"
                fill="#34A853"
              />
              <path
                d="M12.2 29.3c-.4-1.3-.7-2.7-.7-4.3s.2-3 .7-4.3V14.5H5.1C3.6 17.5 2.8 20.7 2.8 25s.8 7.5 2.3 10.5l7.1-6.2z"
                fill="#FBBC05"
              />
              <path
                d="M24 11.9c3.1 0 5.9 1.1 8.1 3.2l6.1-6.1C34.5 5.5 29.7 3.5 24 3.5 15.7 0 8.6 8.4 5.1 14.5l7.1 6.2c1.7-5 6.3-8.8 11.8-8.8z"
                fill="#EA4335"
              />
            </svg>

            {oauthLoading ? "Opening Google…" : "Continue with Google"}
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={handleGuest}>
            Continue as Guest
          </Button>

          <Button
          type="button"
          variant="ghost"
          className="w-full justify-center text-sm"
          onClick={() => navigate("/signup")}
          >
          Don’t have an account? Create one
        </Button>
        </div>
      </motion.div>
    </div>
  );
}