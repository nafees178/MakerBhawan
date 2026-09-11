import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { RoleForm } from "./RoleForm";

export default async function AdminUsersPage() {
  const viewer = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, roll_no, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const users = data as Profile[];

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Users <span className="font-mono text-base text-muted">[{users.length}]</span>
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted">
        Everyone who has signed in. IIT Jodhpur addresses start as students, others as guests.
        Coordinators can edit content; admins can also change roles here.
      </p>
      <ul className="divide-y divide-line border-t border-line">
        {users.map((u) => (
          <li key={u.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_8rem_16rem] sm:items-center sm:gap-6">
            <div className="min-w-0">
              <p className="truncate font-medium">{u.full_name ?? u.email}</p>
              {u.full_name && <p className="truncate text-sm text-muted">{u.email}</p>}
            </div>
            <span className="font-mono text-sm text-muted">{formatDate(u.created_at)}</span>
            {u.id === viewer.id ? (
              <span className="text-sm text-muted">{u.role} (you)</span>
            ) : (
              <RoleForm id={u.id} role={u.role} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
