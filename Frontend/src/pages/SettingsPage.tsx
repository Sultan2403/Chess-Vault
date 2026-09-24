import { useState } from "react";
import { CheckCircle2, Gamepad2, Link2, LogOut, Save, UserRound } from "lucide-react";
import { SignOutButton, UserProfile } from "@clerk/react";
import { Button } from "../components/ui/Button";

type SettingsTab = "profile" | "connections" | "preferences";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs: { id: SettingsTab; label: string; icon: typeof UserRound }[] = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "connections", label: "Connections", icon: Link2 },
    { id: "preferences", label: "Preferences", icon: Save },
  ];

  return (
    <div className="mx-auto grid max-w-[1120px] gap-14 px-6 py-16 md:grid-cols-[260px_1fr]">
      <aside>
        <h1 className="font-display text-5xl font-bold">Settings</h1>
        <nav className="mt-8 space-y-2">
          {tabs.map(({ id, label, icon: Glyph }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-4 rounded-vault px-5 py-4 text-left text-sm font-bold tracking-[.1em] transition-colors cursor-pointer ${
                  isActive
                    ? "bg-vault-secondary-fixed text-vault-on-secondary-fixed-variant"
                    : "hover:bg-vault-surface-soft text-vault-text-secondary"
                }`}
              >
                <Glyph size={20} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-vault-line">
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-vault px-5 py-4 text-left text-sm font-bold tracking-[.1em] text-vault-error/80 transition-colors hover:bg-vault-error/10 hover:text-vault-error cursor-pointer"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      <section className="min-w-0">
        {activeTab === "profile" && (
          <div>
            <div className="border-b border-vault-line pb-7">
              <h2 className="text-2xl font-bold">Account Management</h2>
              <p className="mt-3 text-vault-text-secondary">
                Manage your profile details, security credentials, and authentication settings.
              </p>
            </div>
            <div className="mt-8 flex justify-center sm:justify-start">
              <UserProfile routing="hash" />
            </div>
          </div>
        )}

        {activeTab === "connections" && (
          <section>
            <div className="border-b border-vault-line pb-7">
              <h2 className="text-2xl font-bold">Connected Platforms</h2>
              <p className="mt-3 text-vault-text-secondary">
                Link your accounts to automatically import games into your archive.
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
        )}

        {activeTab === "preferences" && (
          <section>
            <div className="border-b border-vault-line pb-7">
              <h2 className="text-2xl font-bold">Archive Preferences</h2>
              <p className="mt-3 text-vault-text-secondary">
                Choose how moves are displayed and configure auto-analysis settings.
              </p>
            </div>
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
                type="button"
                aria-label="Toggle auto-analysis"
                className="h-7 w-13 rounded-full bg-vault-secondary p-1 cursor-pointer"
              >
                <span className="block h-5 w-5 translate-x-6 rounded-full bg-vault-on-secondary transition" />
              </button>
            </div>
          </section>
        )}
      </section>
    </div>
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
