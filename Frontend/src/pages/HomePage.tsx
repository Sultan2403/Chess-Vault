import { useAuth } from "@clerk/react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          Chess Vault
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">Your chess world, organized.</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Keep your notes, games, and training plans in one place with a simple, secure workspace.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {!isLoaded ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : isSignedIn ? (
            <Link
              className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              to="/dashboard"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
                to="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="rounded-full border border-white/15 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                to="/sign-up"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
