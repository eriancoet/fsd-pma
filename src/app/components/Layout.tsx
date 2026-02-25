import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { CheckSquare, LayoutGrid, Settings, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinkBase =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";

  const navLinkActive =
    "bg-muted text-foreground";

  const navLinkInactive =
    "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-card text-card-foreground border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/projects" className="flex items-center gap-2">
              {/* Brand accent can stay blue */}
              <div className="bg-blue-600 p-2 rounded-lg">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PMA</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/projects"
                className={[
                  navLinkBase,
                  isActive("/projects") ? navLinkActive : navLinkInactive,
                ].join(" ")}
              >
                <LayoutGrid className="h-4 w-4" />
                Projects
              </Link>

              <Link
                to="/settings"
                className={[
                  navLinkBase,
                  isActive("/settings") ? navLinkActive : navLinkInactive,
                ].join(" ")}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            {/* User Info - Desktop (Dropdown) */}
            {user && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="hidden md:flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-muted transition-colors"
                    aria-label="User menu"
                  >
                    <div className="text-right">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>

                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    className="z-50 min-w-[200px] rounded-xl border border-border bg-card p-2 shadow-lg text-card-foreground"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted"
                      >
                        <Settings className="h-4 w-4" />
                        Account
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-2 h-px bg-border" />

                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none hover:bg-muted"
                      onSelect={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border mt-2 pt-4">
              <div className="space-y-2">
                <Link
                  to="/projects"
                  className={[
                    navLinkBase,
                    isActive("/projects") ? navLinkActive : navLinkInactive,
                  ].join(" ")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Projects
                </Link>

                <Link
                  to="/settings"
                  className={[
                    navLinkBase,
                    isActive("/settings") ? navLinkActive : navLinkInactive,
                  ].join(" ")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>

              {user && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}