import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User as SbUser, Session } from "@supabase/supabase-js";
import type { User } from "../types"; // your app User type
console.log("✅ AuthProvider mounted");

interface AuthContextType {
  user: User | null;                 // your app user shape (for UI)
  sbUser: SbUser | null;             // raw supabase user (useful later)
  session: Session | null;
  isGuest: boolean;
  loading: boolean;

  // keep your old behaviors
  login: (name: string, email: string) => void;     // local login (not real auth)
  continueAsGuest: () => void;

  // new
  logout: () => Promise<void>;       // logs out from supabase + clears local
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUserToAppUser(u: SbUser): User {
  const meta: any = u.user_metadata || {};
  return {
    id: u.id,
    name: meta.full_name || meta.name || u.email?.split("@")[0] || "User",
    email: u.email || "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sbUser, setSbUser] = useState<SbUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1) Load local guest/local-login from storage (fallback only)
  useEffect(() => {
    const storedUser = localStorage.getItem("pm_user");
    const storedGuest = localStorage.getItem("pm_guest");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsGuest(false);
    } else if (storedGuest === "true") {
      setIsGuest(true);
      setUser({
        id: "guest",
        name: "Guest User",
        email: "guest@example.com",
      });
    }
  }, []);

  // 2) Load Supabase session + listen for OAuth sign-in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session ?? null;
      setSession(s);
      setSbUser(s?.user ?? null);

      if (s?.user) {
  setUser(mapSupabaseUserToAppUser(s.user));
  setIsGuest(false);
  // DON'T delete pm_guest/pm_user here
}
      
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSbUser(s?.user ?? null);

      if (s?.user) {
        setUser(mapSupabaseUserToAppUser(s.user));
        setIsGuest(false);
        localStorage.removeItem("pm_guest");
        localStorage.removeItem("pm_user");
      } else {
        // If no supabase session, keep whatever local user/guest was set
        // (do nothing here)
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // local "login" (still not real auth)
  const login = (name: string, email: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    setUser(newUser);
    setIsGuest(false);
    localStorage.setItem("pm_user", JSON.stringify(newUser));
    localStorage.removeItem("pm_guest");
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: "guest",
      name: "Guest User",
      email: "guest@example.com",
    };
    setUser(guestUser);
    setIsGuest(true);
    localStorage.setItem("pm_guest", "true");
    localStorage.removeItem("pm_user");
  };

  const logout = async () => {
    // sign out from supabase (if signed in)
    await supabase.auth.signOut();

    // clear local
    setUser(null);
    setSbUser(null);
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem("pm_user");
    localStorage.removeItem("pm_guest");
  };

  const value = useMemo(
    () => ({ user, sbUser, session, isGuest, loading, login, logout, continueAsGuest }),
    [user, sbUser, session, isGuest, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
