import { SignIn, SignUp } from "@clerk/react";
import { Link } from "react-router-dom";

type AuthPageProps = {
  mode: "sign-in" | "sign-up";
};

export default function AuthPage({ mode }: AuthPageProps) {
  return (
    <div className="min-h-screen bg-vault-background px-4 py-12 text-vault-on-background sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 rounded-vault border border-vault-outline-variant bg-vault-surface-container-low p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md text-center lg:text-left">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-vault-secondary">
            Chess Vault
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-4 text-base text-vault-text-secondary">
            {mode === "sign-in"
              ? "Sign in to continue organizing your chess study material."
              : "Register to start building your personal chess library."}
          </p>

          <p className="mt-6 text-sm text-vault-text-secondary">
            {mode === "sign-in" ? (
              <>
                Need an account?{" "}
                <Link
                  to="/sign-up"
                  className="font-medium text-vault-secondary transition-colors hover:text-vault-on-secondary-container"
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  className="font-medium text-vault-secondary transition-colors hover:text-vault-on-secondary-container"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="w-full max-w-md rounded-vault bg-vault-surface-container-lowest p-3 sm:p-4">
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
