"use client";

import { useActionState } from "react";
import { setRole } from "@/app/(pages)/admin/actions";
import { ROLES, type FormState, type Role } from "@/lib/types";

export function RoleForm({ id, role }: { id: string; role: Role }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setRole, {});

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="role" defaultValue={role} className="input w-auto py-1.5" aria-label="Role">
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-ground">
            {r}
          </option>
        ))}
      </select>
      <button className="btn-ghost py-1.5" disabled={pending}>
        {pending ? "…" : "Set"}
      </button>
      {state.error && <span className="w-full text-xs text-ember">{state.error}</span>}
    </form>
  );
}
