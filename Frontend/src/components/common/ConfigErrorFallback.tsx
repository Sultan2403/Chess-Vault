import React from "react";
import { AlertTriangle, Terminal, RefreshCw, ShieldAlert, Mail } from "lucide-react";

const CAPABILITY_DESCRIPTIONS: Record<string, string> = {
  VITE_CLERK_PUBLISHABLE_KEY: "Authentication is unavailable.",
  VITE_API_URL: "API communication is unavailable.",
};

const DEFAULT_CAPABILITY_ERROR = "A required application service is unavailable.";

interface ConfigErrorFallbackProps {
  errors: Record<string, string[] | undefined>;
  isDev?: boolean;
}

export const ConfigErrorFallback: React.FC<ConfigErrorFallbackProps> = ({
  errors,
  isDev = false,
}) => {
  const errorKeys = Object.keys(errors).filter(
    (key) => errors[key] && errors[key]!.length > 0,
  );

  const errorEntries = Object.entries(errors).filter(
    ([, messages]) => messages && messages.length > 0,
  );

  const affectedCapabilities = Array.from(
    new Set(
      errorKeys.map((key) => CAPABILITY_DESCRIPTIONS[key] ?? DEFAULT_CAPABILITY_ERROR),
    ),
  );

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-vault-background p-4 text-vault-on-background">
      <div className="w-full max-w-lg rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-vault-border-base pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-vault-error-container text-vault-on-error-container">
            {isDev ? (
              <AlertTriangle className="h-5 w-5 text-vault-error" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-vault-error" />
            )}
          </div>
          <div>
            <h1 className="font-display text-headline-md text-vault-text-primary">
              {isDev ? "Configuration Error" : "Application Unavailable"}
            </h1>
            <p className="text-body-sm text-vault-text-muted">
              {isDev
                ? "Environment variables validation failed"
                : "Unable to initialize core services"}
            </p>
          </div>
        </div>

        {isDev ? (
          /* Development detailed view */
          <div className="mt-5 space-y-4">
            <p className="text-body-sm text-vault-text-secondary">
              Chess Vault cannot start because some required frontend environment
              variables are missing or invalid:
            </p>

            <div className="space-y-2.5 rounded-md border border-vault-border-base bg-vault-surface-container-lowest p-3.5 font-mono text-xs">
              {errorEntries.map(([key, messages]) => (
                <div key={key} className="space-y-1">
                  <span className="font-semibold text-vault-primary">{key}</span>
                  <ul className="list-inside list-disc text-vault-error">
                    {messages?.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-vault-border-base bg-vault-surface-layer-2 p-3 text-body-sm text-vault-text-muted">
              <div className="flex items-center gap-2 font-medium text-vault-text-secondary">
                <Terminal className="h-4 w-4 text-vault-bronze" />
                <span>How to fix:</span>
              </div>
              <p className="mt-1 text-xs">
                Check your <code className="rounded bg-vault-surface-container px-1 py-0.5 text-vault-primary">Frontend/.env</code> or <code className="rounded bg-vault-surface-container px-1 py-0.5 text-vault-primary">Frontend/.env.local</code> file and ensure all variables above are set correctly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-vault-primary px-4 py-2.5 text-sm font-semibold text-vault-on-primary transition hover:bg-vault-ochre-hover"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        ) : (
          /* Production safe view: no raw keys, URLs, or infrastructure leakage */
          <div className="mt-5 space-y-4">
            <p className="text-body-sm text-vault-text-secondary">
              Chess Vault encountered a critical configuration problem during initialization. The following capabilities are affected:
            </p>

            <ul className="space-y-2 rounded-md border border-vault-border-base bg-vault-surface-container-lowest p-3.5 text-sm text-vault-error">
              {affectedCapabilities.map((capability, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-vault-error">•</span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 rounded-md border border-vault-border-base bg-vault-surface-layer-2 p-3 text-body-sm text-vault-text-muted">
              <Mail className="h-4 w-4 flex-shrink-0 text-vault-bronze" />
              <span className="text-xs text-vault-text-secondary">
                Please contact the administrator or support if this issue persists.
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-vault-primary px-4 py-2.5 text-sm font-semibold text-vault-on-primary transition hover:bg-vault-ochre-hover"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigErrorFallback;
