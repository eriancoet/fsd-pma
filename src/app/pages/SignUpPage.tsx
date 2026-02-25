import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { UserPlus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already signed in, go to projects
  useEffect(() => {
    if (!loading && user && user.id !== "guest") {
      navigate("/projects");
    }
  }, [loading, user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    setAlreadyExists(false);
    e.preventDefault();
    setErrorMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    const newErrors: typeof errors = {};

    if (!cleanName) newErrors.name = "Name is required";
    if (!cleanEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(cleanEmail))
      newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();

        const looksLikeExists =
          msg.includes("already") ||
          msg.includes("registered") ||
          msg.includes("exists") ||
          (msg.includes("user") && msg.includes("registered"));

        if (looksLikeExists) {
          setAlreadyExists(true);
          setErrorMsg(
            "It looks like you already have an account. Try signing in or reset your password."
          );
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary p-3 rounded-xl">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Sign up to start managing your projects
        </p>

        {success || alreadyExists ? (
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-4 text-sm text-foreground bg-muted/20">
              {alreadyExists ? (
                <>
                  That email may already be registered.
                  <br />
                  Try signing in, or reset your password.
                </>
              ) : (
                <>
                  If email confirmation is enabled, we’ve sent a verification
                  link to <span className="font-medium">{email}</span>.
                  <br />
                  Please check your inbox (and spam/junk).
                </>
              )}
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/")}>
                Go to Login
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(
                    `/forgot-password?email=${encodeURIComponent(
                      email.trim()
                    )}`
                  )
                }
              >
                Reset Password
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="John Doe"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

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
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
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
                placeholder="Create a password"
                className="mt-1"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {errorMsg && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create Account"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => navigate("/")}
            >
              Back to Login
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}