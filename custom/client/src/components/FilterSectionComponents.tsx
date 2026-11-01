import { type ReactNode } from "react";

export function SideSection({
  panelId,
  title,
  open,
  onToggle,
  badge,
  dark = false,
  light = false,
  className = "",
  contentClassName = "",
  children,
}: {
  panelId: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  badge?: string | null;
  dark?: boolean;
  light?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`py-2.5 border-b border-[var(--border)]/70 last:border-b-0 ${
        dark ? "border-white/10" : light ? "border-[var(--border)]/70" : ""
      } ${className}`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Thu gọn" : "Mở rộng"} mục ${title}`}
          className={`flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition cursor-pointer ${
            dark
              ? "text-[14px] font-bold text-white hover:bg-white/10"
              : "text-[14px] font-bold text-[var(--text)] hover:bg-[var(--surface2)]"
          }`}
        >
          <span className="tracking-tight">{title}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {!open && badge && (
              <span className="max-w-[110px] truncate rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                {badge}
              </span>
            )}
            <svg
              aria-hidden
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              } ${dark ? "text-white/60" : "text-[var(--dim)]"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </button>
      </h3>
      {open && (
        <div id={panelId} className={`px-1 pt-2 pb-1 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FilterOptionRow({
  label,
  count,
  active,
  onClick,
  ariaLabel,
  disabled = false,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`group flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] transition-all cursor-pointer ${
        active
          ? "bg-[var(--accent)] text-white font-semibold shadow-xs"
          : disabled
            ? "cursor-not-allowed opacity-40 text-[var(--dim)]"
            : "text-[var(--text)] hover:bg-[var(--surface2)] font-medium"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden
          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${
            active
              ? "border-white bg-white text-[var(--accent)]"
              : "border-[var(--dim)]/50 group-hover:border-[var(--dim)]"
          }`}
        >
          {active && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {count != null && (
        <span
          aria-hidden
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums font-semibold transition-colors ${
            active
              ? "bg-white/20 text-white"
              : "bg-[var(--surface2)] text-[var(--dim)] group-hover:text-[var(--text)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function RadioOptionRow({
  label,
  count,
  active,
  onClick,
  ariaLabel,
  disabled = false,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <FilterOptionRow
      label={label}
      count={count}
      active={active}
      onClick={onClick}
      ariaLabel={ariaLabel}
      disabled={disabled}
    />
  );
}

