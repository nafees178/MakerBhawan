"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          placeholder="b23xx0000@iitj.ac.in"
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
          className={cn("input mt-2", state.error && "border-ember focus:border-ember")}
        />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
          className={cn("input mt-2", state.error && "border-ember focus:border-ember")}
        />
      </label>
      {/* role="alert" so a screen reader hears the refusal without having to
          go looking for it after the form re-renders. */}
      <p id="login-error" role="alert" className="text-sm text-ember">
        {state.error}
      </p>
      <button className="btn" disabled={pending} aria-busy={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
