import { Search, Shield, Radio } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useAccountBootstrap } from "../../hooks/useAccount";

const navItems = [
  { to: "/dashboard", label: "Library" },
  { to: "/game-bank", label: "Game Bank" },
  { to: "/collections", label: "Folders" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { data: accountData } = useAccountBootstrap();
  const profileName = user?.firstName ?? user?.username ?? "Scholar";

  // Derive connected sources text
  const connectedCount = accountData?.linkedAccounts?.length ?? 0;
  const connectedLabel =
    connectedCount > 0
      ? `Archived: ${accountData?.linkedAccounts.map((a) => a.platform === "chess.com" ? "Chess.com" : "Lichess").join(" & ")}`
      : "Archived: Chess.com & Lichess";

  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background flex flex-col font-body selection:bg-vault-primary/20 selection:text-vault-primary">
      {/* Editorial Registry Header */}
      <header className="border-b border-vault-border-base bg-vault-surface-container-lowest/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          {/* Brand Mark */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="grid h-8 w-8 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-primary transition-colors group-hover:border-vault-bronze">
              <Shield size={16} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-vault-text-primary leading-none">
                CHESS VAULT
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-vault-text-muted mt-0.5">
                Archival Registry
              </span>
            </div>
          </Link>

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

            {/* Index Search Button */}
            <button
              type="button"
              onClick={() => {
                // Focus search or trigger modal
                const searchInput = document.getElementById("global-search-input");
                if (searchInput) {
                  searchInput.focus();
                }
              }}
              className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1/60 px-2.5 py-1 text-[11px] text-vault-text-muted hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Search size={12} />
              <span className="tracking-wide">INDEX SEARCH</span>
            </button>

            {/* Profile Avatar */}
            <Link
              to="/settings"
              title="Account & Preferences"
              className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-vault-border-interactive bg-vault-surface-layer-2 text-xs font-semibold text-vault-primary transition-colors hover:border-vault-bronze"
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={profileName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : null}
              <span>{profileName.slice(0, 1).toUpperCase()}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-vault-background">{children}</main>

      {/* Archival Registry Footer */}
      <footer className="border-t border-vault-border-base bg-vault-surface-container-lowest/80 py-6 text-xs text-vault-text-muted font-mono">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-vault-text-secondary font-medium tracking-wide">
              CHESS VAULT
            </span>
            <span>•</span>
            <span>MONOGRAPH ARCHIVE</span>
            <span>•</span>
            <span>PERMANENT RECORD</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Ref: FIDE / PGN / EPD Specification</span>
            <Link
              to="/settings"
              className="hover:text-vault-text-primary transition-colors"
            >
              Archival Preferences
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
