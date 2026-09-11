import { NavLink } from "@/components/NavLink";
import { requireCoordinator } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireCoordinator();

  const tabs = [
    { href: "/admin/events", label: "Events" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/people", label: "People" },
    ...(viewer.role === "admin" ? [{ href: "/admin/users", label: "Users" }] : []),
  ];

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="label">Admin</p>
          <p className="mt-1 text-sm text-muted">
            {viewer.email} · <span className="text-ink">{viewer.role}</span>
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {tabs.map((t) => (
            <NavLink key={t.href} href={t.href}>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
