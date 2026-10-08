import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-vault-background px-6 py-16 text-vault-on-background">
      <div className="w-full max-w-lg rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-8 text-center shadow-2xl">
        <FileQuestion className="mx-auto h-10 w-10 text-vault-bronze" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-vault-bronze">404 / Page not found</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-vault-text-primary">We couldn’t find that page</h1>
        <p className="mt-3 text-sm leading-relaxed text-vault-text-secondary">
          There’s no page at <span className="font-mono text-vault-text-primary">{location.pathname}</span>.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex rounded-md bg-vault-primary px-4 py-2.5 text-sm font-semibold text-vault-on-primary transition hover:bg-vault-ochre-hover"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex rounded-md border border-vault-border-interactive px-4 py-2.5 text-sm text-vault-text-secondary transition hover:text-vault-text-primary"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
