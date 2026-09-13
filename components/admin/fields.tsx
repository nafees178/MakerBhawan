import Link from "next/link";

interface FieldProps {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: "text" | "number" | "url" | "email" | "datetime-local";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  list?: string;
}

export function Field({ label, name, defaultValue, type = "text", required, placeholder, hint, list }: FieldProps) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        list={list}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? 1 : undefined}
        className="input mt-2"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} className="input mt-2 resize-y" />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select name={name} defaultValue={defaultValue ?? options[0]?.value} className="input mt-2">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#ff6a1a]" />
      {label}
    </label>
  );
}

export function EditorHeader({ backHref, backLabel, title }: { backHref: string; backLabel: string; title: string }) {
  return (
    <div className="mb-8">
      <Link href={backHref} className="link text-sm text-muted">
        ← {backLabel}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}

export function DeleteForm({ action, label }: { action: () => Promise<void>; label: string }) {
  return (
    <form action={action} className="mt-12 max-w-2xl border-t border-line pt-6">
      <button className="text-sm text-muted transition-colors hover:text-ember">{label}</button>
    </form>
  );
}

export interface ListRow {
  id: string;
  href: string;
  primary: string;
  secondary?: string | null;
  meta?: string | null;
  flag?: string | null;
}

export function AdminList({
  title,
  newHref,
  newLabel,
  rows,
  empty,
}: {
  title: string;
  newHref?: string;
  newLabel?: string;
  rows: ListRow[];
  empty: string;
}) {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title} <span className="font-mono text-base text-muted">[{rows.length}]</span>
        </h1>
        {newHref && (
          <Link href={newHref} className="btn">
            {newLabel ?? "New"}
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="grid gap-1 py-3 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1fr_17rem_6rem] sm:items-baseline sm:gap-6"
              >
                <span className="font-medium">
                  {r.primary}
                  {r.flag && <span className="ml-2 font-mono text-[11px] uppercase text-ember">{r.flag}</span>}
                </span>
                <span className="text-sm text-muted">{r.secondary}</span>
                <span className="font-mono text-sm tabular-nums text-muted sm:text-right">{r.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
