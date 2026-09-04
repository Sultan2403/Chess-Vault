import { BookOpen, Library, Search, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const navItems = [
  { to: "/dashboard", label: "Library", icon: Library },
  { to: "/library", label: "Folders", icon: BookOpen },
  { to: "/settings", label: "Account", icon: UserRound },
];
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-vault-background text-vault-on-background">
      <header className="border-b border-vault-outline-variant">
        <div className="mx-auto flex h-24 max-w-content items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img
              src={logo}
              className="h-11 w-11 rounded-vault object-cover"
              alt="Chess Vault"
            />
            <span className="font-display text-3xl font-bold italic sm:text-4xl">
              Chess Vault
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `border-b-2 py-2 text-sm font-bold uppercase tracking-[.18em] transition-colors ${isActive ? "border-vault-secondary text-vault-secondary" : "border-transparent hover:text-vault-secondary"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Search size={20} />
            <div className="grid h-11 w-11 place-items-center rounded-full border border-vault-outline-variant bg-vault-surface-soft text-sm font-bold">
              A
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-vault-outline-variant bg-vault-surface-muted">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 text-sm text-vault-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <strong className="text-base text-vault-on-background">
            Chess Vault
          </strong>
          <span>© 2024 Chess Vault. A curated history of every move.</span>
          <div className="flex gap-5">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#support">Archive Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
