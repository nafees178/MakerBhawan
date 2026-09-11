"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { step: "email" });

  if (state.step === "code") {
    return (
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="email" value={state.email} />
        <p className="text-sm text-muted">
          We emailed <span className="text-ink">{state.email}</span>. Enter the code from it, or open its
          sign-in link in this browser.
        </p>
        <label className="block">
          <span className="label">Code</span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,12}"
            maxLength={12}
            required
            autoFocus
            placeholder="123456"
            className="input mt-2 max-w-[12rem] font-mono text-lg tracking-[0.3em]"
          />
        </label>
        {state.error && <p className="text-sm text-ember">{state.error}</p>}
        {state.notice && !state.error && <p className="text-sm text-muted">{state.notice}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button name="intent" value="verify" className="btn" disabled={pending}>
            {pending ? "Checking…" : "Sign in"}
          </button>
          <button name="intent" value="resend" formNoValidate className="link text-sm text-muted" disabled={pending}>
            Send a new code
          </button>
          <button name="intent" value="restart" formNoValidate className="link text-sm text-muted" disabled={pending}>
            Use a different email
          </button>
        </div>
      </form>
    );
  }

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
          className="input mt-2"
        />
      </label>
      {state.error && <p className="text-sm text-ember">{state.error}</p>}
      <button name="intent" value="send" className="btn" disabled={pending}>
        {pending ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}
