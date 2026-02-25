import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail } from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (e) setEmail(e);
  }, []);

  const resetRedirectTo = useMemo(() => {
    // User clicks email link and returns to your app here:
    return `${window.location.origin}/reset-password`;
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetRedirectTo,
      });

      // IMPORTANT: don't reveal whether the email exists (prevents enumeration)
      if (error) console.error("resetPasswordForEmail error:", error.message);

      setDone(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Mail className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Forgot your password?</h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email and we’ll send you a password reset link.
        </p>

        {done ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-700">
                If an account exists for <span className="font-medium">{email.trim()}</span>, we’ve sent a reset
                link. Please check your inbox (and spam/junk).
              </p>
            </div>

            <Button className="w-full" onClick={() => navigate("/")}>
              Back to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
              />
              {errorMsg && <p className="text-sm text-red-500 mt-1">{errorMsg}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}