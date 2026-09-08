import { Collections } from "../components/dashboard/Collections";
import { RecentGames } from "../components/dashboard/RecentGames";
import { StatSummary } from "../components/dashboard/StatSummary";
import { AppShell } from "../components/layout/AppShell";
import { MotionReveal } from "../components/ui/Motion";
import { useUser } from "@clerk/react";
import { ImportGamesPrompt } from "../components/dashboard/ImportGamesPrompt";

export default function DashboardPage() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.username ?? "there";

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-12 sm:py-16">
        <section className="grid items-center gap-8 border-b border-vault-outline-variant/60 pb-12 md:grid-cols-[1fr_420px]">
          <MotionReveal>
            <h1 className="font-display text-4xl font-bold tracking-tight text-vault-primary sm:text-5xl">
              Good evening, {name}.
            </h1>
            <p className="mt-2 text-sm text-vault-text-secondary">
              Your chess history, kept in one place.
            </p>
          </MotionReveal>
          <MotionReveal delay={0.12}>
            <StatSummary />
          </MotionReveal>
        </section>
        <ImportGamesPrompt />
        <Collections />
        <RecentGames />
      </div>
    </AppShell>
  );
}

