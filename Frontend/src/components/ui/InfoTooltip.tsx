import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  text: string;
  align?: "left" | "center" | "right";
  position?: "top" | "bottom";
}

/**
 * Subtle `?` info trigger that reveals a hover/focus explanatory tooltip.
 */
export function InfoTooltip({
  text,
  align = "center",
  position = "bottom",
}: InfoTooltipProps) {
  const alignClasses =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  const positionClasses =
    position === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <span className="relative inline-flex items-center group align-middle">
      <button
        type="button"
        aria-label={text}
        className="inline-flex items-center justify-center rounded-full text-vault-text-muted hover:text-vault-primary focus:outline-hidden focus-visible:text-vault-primary transition-colors cursor-help"
      >
        <HelpCircle size={14} />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 absolute z-50 w-64 rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 px-3 py-2 font-mono text-[11px] leading-relaxed normal-case tracking-normal font-normal text-vault-text-secondary shadow-xl backdrop-blur-sm ${positionClasses} ${alignClasses}`}
      >
        {text}
      </span>
    </span>
  );
}
