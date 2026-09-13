import { cn } from "@/lib/utils";

/**
 * Long-form body text out of the database. Content is authored as plain
 * paragraphs separated by a blank line, which is what a coordinator types into
 * the admin textarea, so it renders as paragraphs rather than as one block with
 * newlines collapsed. Deliberately not markdown: nothing here needs it, and
 * parsing user text as markup is a surface nobody has asked for.
 */
export function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-5 text-[1.0625rem] leading-relaxed text-ink/85", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
