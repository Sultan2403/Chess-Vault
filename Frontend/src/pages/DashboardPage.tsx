import { AppShell } from "../components/layout/AppShell";
import { Collections } from "../components/dashboard/Collections";
import { RecentGames } from "../components/dashboard/RecentGames";
import { StatSummary } from "../components/dashboard/StatSummary";

export default function DashboardPage() {
  // TODO(api): replace these presentation values with a query hook backed by the games and folders APIs.
  return <AppShell><div className="mx-auto max-w-[1120px] px-6 py-18 sm:py-24"><section className="grid items-center gap-9 border-b border-vault-line pb-10 md:grid-cols-[1fr_490px]"><div className="animate-rise-in"><p className="font-display text-4xl font-bold sm:text-5xl">Good evening, Alex.</p><p className="mt-3 text-lg text-vault-secondary">Your chess history, kept in one place.</p></div><StatSummary/></section><Collections/><RecentGames/></div></AppShell>;
}
