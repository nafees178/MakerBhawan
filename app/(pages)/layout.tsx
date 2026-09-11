// Inner pages share a contained column; the homepage runs full-bleed.
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">{children}</div>;
}
