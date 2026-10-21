import { Radio, Settings, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { useAccountBootstrap } from "../../hooks/useAccount";
import { ThemeToggle } from "../ui/ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/game-bank", label: "Game Bank" },
  { to: "/collections", label: "Collections" },
  { to: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { data: accountData } = useAccountBootstrap();

  // Derive connected sources text
  const connectedCount = accountData?.linkedAccounts?.length ?? 0;
  const connectedLabel =
    connectedCount > 0
      ? `Connected: ${accountData?.linkedAccounts.map((a) => a.platform === "chess.com" ? "Chess.com" : "Lichess").join(" & ")}`
      : "Connected: Chess.com & Lichess";

  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background flex flex-col font-body selection:bg-vault-primary/20 selection:text-vault-primary">
      {/* Header */}
      <header className="border-b border-vault-border-base bg-vault-surface-container-lowest/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          {/* Brand Mark */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="grid h-8 w-8 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-primary transition-colors group-hover:border-vault-bronze">
              <Shield size={16} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-vault-text-primary leading-none">
                CHESS VAULT
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-vault-text-muted mt-0.5">
                Personal Archive
              </span>
            </div>
          </NavLink>

          {/* Center Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-vault-bronze after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-vault-bronze"
                      : "text-vault-text-secondary hover:text-vault-text-primary"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Sync Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-xs border border-vault-border-base bg-vault-surface-layer-1/80 px-2.5 py-1 text-[11px] text-vault-text-secondary">
              <Radio size={12} className="text-vault-win animate-pulse" />
              <span>{connectedLabel}</span>
            </div>

            {/* Quick Theme Toggle */}
            <ThemeToggle />

            {/* User Account / Profile Menu */}
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/settings"
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Settings"
                  labelIcon={<Settings size={14} />}
                  href="/settings"
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-vault-background">{children}</main>

      {/* Footer */}
      <footer className="border-t border-vault-border-base bg-vault-surface-container-lowest/80 py-6 text-xs text-vault-text-muted font-mono">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-vault-text-secondary font-medium tracking-wide">
              Chess Vault
            </span>
            <span>—</span>
            <span>Personal Chess Archive</span>
          </div>

          <div className="flex items-center gap-6">
            <NavLink
              to="/game-bank"
              className="hover:text-vault-text-primary transition-colors"
            >
              Game Bank
            </NavLink>
            <NavLink
              to="/collections"
              className="hover:text-vault-text-primary transition-colors"
            >
              Collections
            </NavLink>
            <NavLink
              to="/settings"
              className="hover:text-vault-text-primary transition-colors"
            >
              Settings
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

