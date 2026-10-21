import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, type Theme } from "../../contexts";
import { cn } from "../../utils/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1 text-vault-text-secondary transition-colors hover:border-vault-bronze hover:text-vault-text-primary cursor-pointer",
        className,
      )}
      title={`Active theme: ${resolvedTheme}. Click to toggle.`}
    >
      {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

interface ThemeSegmentedPickerProps {
  className?: string;
}

export function ThemeSegmentedPicker({ className }: ThemeSegmentedPickerProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "inline-flex items-center gap-1 rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1 p-1",
        className,
      )}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-vault px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              isActive
                ? "bg-vault-surface-layer-2 text-vault-text-primary border-b border-vault-bronze shadow-xs font-semibold"
                : "text-vault-text-muted hover:text-vault-text-secondary hover:bg-vault-surface-layer-2/50",
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
