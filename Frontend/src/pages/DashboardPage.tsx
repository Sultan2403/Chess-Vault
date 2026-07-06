import { useAuth, useClerk, useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

export default function DashboardPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();

  if (!authLoaded || !userLoaded) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">Loading your account…</div>;
  }

  if (!isSignedIn || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Chess Vault Dashboard</h1>
            <p className="mt-2 text-slate-300">
              Welcome back, {user.firstName || user.username || "player"}.
            </p>
          </div>

          <button
            type="button"
            className="rounded-full border border-white/15 px-5 py-2.5 font-medium text-slate-200 transition hover:bg-white/10"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold">Your game library</h2>
          <p className="mt-3 text-slate-300">
            Protected content will appear here once your backend is connected.
          </p>
          
        </section>
      </div>
    </div>
  );
}
