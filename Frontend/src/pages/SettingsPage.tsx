import { CheckCircle2, Gamepad2, Link2, Save, UserRound } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1120px] gap-14 px-6 py-16 md:grid-cols-[260px_1fr]">
        <aside>
          <h1 className="font-display text-5xl font-bold">Settings</h1>
          <nav className="mt-8 space-y-2">
            {[
              [UserRound, "Profile"],
              [Link2, "Connections"],
              [Save, "Preferences"],
            ].map(([Icon, label]) => {
              const Glyph = Icon as typeof UserRound;
              return (
                <button
                  key={label as string}
                  className={`flex w-full items-center gap-4 rounded-vault px-5 py-4 text-left text-sm font-bold tracking-[.1em] ${label === "Profile" ? "bg-vault-secondary-fixed text-vault-on-secondary-fixed-variant" : "hover:bg-vault-surface-soft"}`}
                >
                  <Glyph size={20} />
                  {label as string}
                </button>
              );
            })}
          </nav>
        </aside>
        <section>
          <div className="border-b border-vault-line pb-7">
            <h2 className="text-2xl font-bold">Personal Details</h2>
            <p className="mt-3 text-vault-text-secondary">
              Manage your archive identity.
            </p>
          </div>
          <div className="mt-9 grid gap-8 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[.15em]">
              Username
              <input
                className="mt-3 w-full border-b border-vault-ink bg-transparent px-3 py-3 text-lg font-normal normal-case tracking-normal outline-none"
                defaultValue="GrandmasterArchive"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[.15em]">
              Email address
              <input
                className="mt-3 w-full border-b border-vault-ink bg-transparent px-3 py-3 text-lg font-normal normal-case tracking-normal outline-none"
                defaultValue="scholar@chessvault.com"
              />
            </label>
          </div>
          <div className="mt-10 flex justify-end">
            <Button variant="dark">
              <Save size={17} /> Save changes
            </Button>
          </div>
          <section className="mt-18">
            <div className="border-b border-vault-line pb-7">
              <h2 className="text-2xl font-bold">Connected Platforms</h2>
              <p className="mt-3 text-vault-text-secondary">
                Link your accounts to automatically import games into your
                archive.
              </p>
            </div>
            <div className="mt-9 space-y-5">
              <Platform
                name="Chess.com"
                detail="Connected as GM_Archive"
                connected
              />
              <Platform name="Lichess" detail="Not connected" />
            </div>
          </section>
          <section className="mt-18 border-t border-vault-line pt-8">
            <h2 className="text-2xl font-bold">Archive Preferences</h2>
            <div className="mt-7 flex items-center justify-between border-b border-vault-line py-6">
              <div>
                <h3 className="text-lg font-bold">Default Notation Style</h3>
                <p className="text-vault-text-secondary">
                  Choose how moves are displayed in the study view.
                </p>
              </div>
              <span className="border border-vault-outline-variant bg-vault-surface-soft px-4 py-3">
                Algebraic (Standard)
              </span>
            </div>
            <div className="flex items-center justify-between py-6">
              <div>
                <h3 className="text-lg font-bold">Auto-Analysis</h3>
                <p className="text-vault-text-secondary">
                  Automatically request evaluation for newly imported games.
                </p>
              </div>
              <button
                aria-label="Toggle auto-analysis"
                className="h-7 w-13 rounded-full bg-vault-secondary p-1"
              >
                <span className="block h-5 w-5 translate-x-6 rounded-full bg-vault-on-secondary transition" />
              </button>
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
function Platform({
  name,
  detail,
  connected = false,
}: {
  name: string;
  detail: string;
  connected?: boolean;
}) {
  return (
    <article
      className={`flex flex-wrap items-center gap-5 rounded-vault border p-7 ${connected ? "border-vault-outline-variant bg-vault-surface-soft" : "border-dashed border-vault-outline-variant"}`}
    >
      <div className="grid h-14 w-14 place-items-center bg-vault-surface-container-lowest text-vault-secondary">
        {connected ? <CheckCircle2 /> : <Gamepad2 />}
      </div>
      <div>
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="mt-1 text-vault-text-secondary">{detail}</p>
      </div>
      <Button className="ml-auto" variant={connected ? "secondary" : "dark"}>
        {connected ? "Sync now" : "Connect account"}
      </Button>
    </article>
  );
}
