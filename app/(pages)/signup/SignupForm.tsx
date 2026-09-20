"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { signUp, type SignupState } from "./actions";

export function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(signUp, {});
  const invalid = Boolean(state.error);
  const described = invalid ? "signup-error" : undefined;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">IIT Jodhpur email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          placeholder="b23xx0000@iitj.ac.in"
          aria-invalid={invalid}
          aria-describedby={described}
          className={cn("input mt-2", invalid && "border-ember focus:border-ember")}
        />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={invalid}
          aria-describedby={described}
          className={cn("input mt-2", invalid && "border-ember focus:border-ember")}
        />
      </label>
      <label className="block">
        <span className="label">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          aria-invalid={invalid}
          aria-describedby={described}
          className={cn("input mt-2", invalid && "border-ember focus:border-ember")}
        />
      </label>
      <p id="signup-error" role="alert" className="text-sm text-ember">
        {state.error}
      </p>
      {!state.error && <p className="text-sm text-muted">At least 8 characters.</p>}
      <button className="btn" disabled={pending} aria-busy={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
