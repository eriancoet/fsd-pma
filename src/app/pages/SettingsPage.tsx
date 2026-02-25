import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Moon, Sun, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext"; 

export function SettingsPage() {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();

  // ✅ GLOBAL THEME (controls <html class="dark">)
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(`Theme changed to ${theme === "light" ? "dark" : "light"} mode`);
  };

  const handleClearData = () => {
    localStorage.removeItem("pm_projects");
    localStorage.removeItem("pm_tasks");
    localStorage.setItem("pm_data_cleared", "true");
    toast.success("All data cleared successfully");
    setClearDataDialogOpen(false);
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-muted p-2 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
                disabled={isGuest}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
                disabled={isGuest}
              />
            </div>

            {isGuest && (
              <div className="bg-muted border border-border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  You're logged in as a guest. Profile changes are disabled.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isGuest}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Appearance Section */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-muted p-2 rounded-lg">
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how the app looks</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">
                Current theme: {theme === "light" ? "Light" : "Dark"}
              </div>
            </div>

                      <Button
            variant="outline"
            onClick={handleToggleTheme}
            className="!bg-transparent !text-foreground !border-border hover:!bg-muted hover:!text-foreground"
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4 w-4" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Light Mode
              </>
            )}
          </Button>
     
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-card text-card-foreground rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-muted p-2 rounded-lg">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <div className="font-medium">Account Type</div>
                <div className="text-sm text-muted-foreground">
                  {isGuest ? "Guest Account" : "Registered Account"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <div className="font-medium">Clear All Data</div>
                <div className="text-sm text-muted-foreground">Delete all projects and tasks</div>
              </div>
              <Button variant="destructive" onClick={() => setClearDataDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            </div>

            <div className="pt-3 border-t border-border">
              <Link to="/">
                <Button variant="destructive" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-muted rounded-lg p-6 text-center border border-border">
          <p className="text-sm text-muted-foreground">PMA v1.0.0 - A project management app</p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 PMA. All data is stored locally in your browser.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={clearDataDialogOpen}
        onOpenChange={setClearDataDialogOpen}
        onConfirm={handleClearData}
        title="Clear All Data"
        description="Are you sure you want to delete all projects and tasks? This action cannot be undone."
        confirmText="Clear Data"
      />
    </div>
  );
}