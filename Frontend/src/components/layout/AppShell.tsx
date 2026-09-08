import { Compass, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "@clerk/react";


const navItems = [
  { to: "/dashboard", label: "LIBRARY" },
  { to: "/library", label: "FOLDERS" },
  { to: "/settings", label: "ACCOUNT" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const profileName = user?.firstName ?? user?.username ?? "Account";

  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background">
      <header className="border-b border-vault-outline-variant/60 bg-vault-background/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto flex h-20 max-w-content items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="font-display text-3xl sm:text-4xl font-bold italic tracking-tight text-vault-primary">
              Chess Vault
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? "text-vault-ochre after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-vault-ochre"
                      : "text-vault-on-surface-variant hover:text-vault-primary"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-vault-text-secondary">
            <button aria-label="Search" className="hover:text-vault-primary transition-colors">
              <Search size={18} strokeWidth={2} />
            </button>
            <button aria-label="Sync accounts" className="hover:text-vault-primary transition-colors">
              <Compass size={18} strokeWidth={2} />
            </button>
            <Link
              to="/settings"
              className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-vault-outline-variant bg-vault-surface-soft text-xs font-semibold text-vault-primary shadow-inner"
            >
              <img
                src={user?.imageUrl}
                alt={profileName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span>{profileName.slice(0, 1).toUpperCase()}</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="bg-paper">{children}</main>
      <footer className="border-t border-vault-outline-variant/60 bg-[#e4e2de]/60 py-8">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 text-xs text-vault-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <strong className="font-display font-bold text-sm text-vault-primary">
              Chess Vault
            </strong>
            <span className="text-vault-text-secondary">
              © {new Date().getFullYear()} Chess Vault. A curated history of every move.
            </span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#terms" className="hover:text-vault-primary transition-colors">Terms</a>
            <a href="#privacy" className="hover:text-vault-primary transition-colors">Privacy</a>
            <a href="#support" className="hover:text-vault-primary transition-colors">Archive Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

