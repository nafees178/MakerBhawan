"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/types";

export function AdminForm({
  action,
  children,
  submitLabel = "Save",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {children}
      {state.error && (
        <p role="alert" className="text-sm text-ember">
          {state.error}
        </p>
      )}
      <button className="btn" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
