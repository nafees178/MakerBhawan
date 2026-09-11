export function PageHeader({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-12 max-w-2xl">
      <p className="label">{label}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-4 text-muted">{children}</div>}
    </header>
  );
}

export function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 className="label mb-4 flex items-baseline gap-2 border-b border-line pb-3">
      {children}
      {count !== undefined && <span className="text-muted/60">[{count}]</span>}
    </h2>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-sm text-muted">{children}</p>;
}
