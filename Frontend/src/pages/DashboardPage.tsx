import { useAuth, useClerk, useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";
import GameViewer from "./GameViewer";

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
          <GameViewer pgnFromDatabase="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8 14. Ng3 g6 15. a4 c5 16. d5 c4 17. Be3 Qc7 18. Qd2 Nc5 19. Nh2 Bg7 20. Ng4 Nxg4 21. hxg4 Bc8 22. f3 Bd7 23. Kf2 Reb8 24. Rh1 bxa4 25. Bh6 Bh8 26. Rh2 Rxb2 27. Rah1 Rab8 28. Bg5 f6 29. Rxh7 Bg7 30. Bh6 Kxh7 31. Bxg7+ Kxg7 32. Qh6+ Kf7 33. Qh7+ Ke8 34. Qg8+ Ke7 35. Rh7#"/>
        </section>
      </div>
    </div>
  );
}
