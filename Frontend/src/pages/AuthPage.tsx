import { SignIn, SignUp } from "@clerk/react";
import { Link } from "react-router-dom";

type AuthPageProps = {
  mode: "sign-in" | "sign-up";
};

export default function AuthPage({ mode }: AuthPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md text-center lg:text-left">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Chess Vault
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-4 text-base text-slate-300">
            {mode === "sign-in"
              ? "Sign in to continue organizing your chess study material."
              : "Register to start building your personal chess library."}
          </p>

          <p className="mt-6 text-sm text-slate-400">
            {mode === "sign-in" ? (
              <>
                Need an account?{" "}
                <Link to="/sign-up" className="font-medium text-blue-400 transition hover:text-blue-300">
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/sign-in" className="font-medium text-blue-400 transition hover:text-blue-300">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white/5 p-3 sm:p-4">
          {mode === "sign-in" ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
            />
          )}
        </div>
      </div>
    </div>
  );
}
