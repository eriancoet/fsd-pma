import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { KeyRound } from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  const navigate = useNavigate();

  // When user arrives from email link, Supabase sets a recovery session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // If there's no session, user likely opened the page directly
      setReady(true);
      if (!data.session) {
        setErrorMsg("This reset link is invalid or has expired. Please request a new one.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // password updated, go login or projects
      navigate("/", { replace: true });
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
            <KeyRound className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Reset your password</h1>
        <p className="text-center text-gray-600 mb-8">
          Choose a new password for your account.
        </p>

        {errorMsg && (
          <div className="rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                autoComplete="new-password"
                placeholder="Enter a new password"
              />
            </div>

            <div>
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1"
                autoComplete="new-password"
                placeholder="Re-enter the new password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/")}>
              Back to login
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}