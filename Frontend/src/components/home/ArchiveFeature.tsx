import { CheckCircle2 } from "lucide-react";
import { MotionReveal } from "../ui/Motion";

const benefits = [
  "Search through your own notes and tags.",
  "Filter by result, date, or specific ECO codes.",
];

export function ArchiveFeature() {
  return (
    <section className="bg-[#2d221c] text-white">
      <div className="mx-auto grid max-w-content gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <MotionReveal>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#fdfbf7]">
            A digital home for your chess history.
          </h2>
          <p className="mt-4 max-w-md text-xs leading-6 text-[#d3c3bd]">
            Chess Vault is a dedicated place to return to, organize, and revisit
            your most important games. Our search tools make it easy to find
            past matches by opponent, opening, or specific moves.
          </p>
          <ul className="mt-8 space-y-3.5 text-xs font-medium text-[#eae8e4]">
            {benefits.map((benefit) => (
              <li className="flex items-center gap-3" key={benefit}>
                <CheckCircle2
                  className="shrink-0 text-vault-ochre"
                  size={16}
                  strokeWidth={2}
                />
                {benefit}
              </li>
            ))}
          </ul>
        </MotionReveal>
        <MotionReveal delay={0.16}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-vault border border-white/10 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=900&auto=format&fit=crop&q=80"
              alt="Chess study in library"
              className="h-full w-full object-cover brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

