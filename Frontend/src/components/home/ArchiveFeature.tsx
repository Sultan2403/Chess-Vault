import { CheckCircle2 } from "lucide-react";
import { MotionReveal } from "../ui/Motion";

const benefits = [
  "Search through your own notes and tags.",
  "Filter by result, date, or specific ECO codes.",
];

export function ArchiveFeature() {
  return (
    <section className="mt-24 bg-vault-primary text-vault-on-primary">
      <div className="mx-auto grid max-w-content gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <MotionReveal>
          <p className="font-display text-lg">
            A digital home for your chess history.
          </p>
          <p className="mt-5 max-w-md text-sm leading-6 text-vault-on-primary-container">
            Chess Vault is a dedicated place to return to, organize, and revisit
            your most important games. Our search tools make it easy to find
            past matches by opponent, opening, or specific moves.
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {benefits.map((benefit) => (
              <li className="flex gap-3" key={benefit}>
                <CheckCircle2
                  className="shrink-0 text-vault-secondary-fixed"
                  size={18}
                />
                {benefit}
              </li>
            ))}
          </ul>
        </MotionReveal>
        <MotionReveal delay={0.16}>
          <div className="relative aspect-[1.36] overflow-hidden border border-vault-on-primary-container bg-[radial-gradient(circle_at_55%_38%,rgba(255,222,165,.55),transparent_9%),radial-gradient(circle_at_35%_58%,rgba(119,90,25,.55),transparent_24%),linear-gradient(135deg,#20110a,#6b3f1b)]">
            <div className="absolute bottom-[17%] left-[15%] h-[28%] w-[57%] rotate-[-6deg] border border-vault-secondary-fixed/50 bg-vault-primary-container" />
            <div className="absolute bottom-[26%] left-[37%] h-20 w-9 rounded-full bg-vault-secondary-fixed/80" />
            <div className="absolute bottom-[26%] left-[52%] h-24 w-10 rounded-full bg-vault-secondary-container/80" />
            <div className="absolute right-[13%] top-[17%] h-[50%] w-px bg-vault-secondary-fixed/80 shadow-[0_0_26px_8px_rgba(255,222,165,.5)]" />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
