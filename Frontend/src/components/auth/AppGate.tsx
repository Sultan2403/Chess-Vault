import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router-dom";
import { useAccountBootstrap } from "../../hooks/useAccount";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";

function AppLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-vault-background">
      <Spinner />
    </div>
  );
}

export function ProtectedAppGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const accountQuery = useAccountBootstrap(Boolean(isLoaded && isSignedIn));

  if (!isLoaded) return <AppLoading />;
  if (!isSignedIn) return <Navigate replace to="/sign-in" />;
  if (accountQuery.isLoading) return <AppLoading />;
  if (accountQuery.isError) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <ErrorBanner message="Unable to load your Chess Vault account." onRetry={() => accountQuery.refetch()} />
      </div>
    );
  }
  if (accountQuery.data?.needsOnboarding) {
    return <Navigate replace to="/onboarding" />;
  }

  return <Outlet />;
}

export function OnboardingGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const accountQuery = useAccountBootstrap(Boolean(isLoaded && isSignedIn));

  if (!isLoaded || accountQuery.isLoading) return <AppLoading />;
  if (!isSignedIn) return <Navigate replace to="/sign-in" />;
  if (accountQuery.isError) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <ErrorBanner message="Unable to load your Chess Vault account." onRetry={() => accountQuery.refetch()} />
      </div>
    );
  }
  if (!accountQuery.data?.needsOnboarding) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}
