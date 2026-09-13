"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
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
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? "code-error" : undefined}
            className={cn(
              "input mt-2 max-w-[12rem] font-mono text-lg tracking-[0.3em]",
              state.error && "border-ember focus:border-ember",
            )}
          />
        </label>
        {/* role="alert" so a screen reader hears the refusal without having to
            go looking for it after the form re-renders. */}
        <p id="code-error" role="alert" className="text-sm text-ember">
          {state.error}
        </p>
        {state.notice && !state.error && (
          <p role="status" className="text-sm text-muted">
            {state.notice}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button name="intent" value="verify" className="btn" disabled={pending} aria-busy={pending}>
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
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "email-error" : "email-hint"}
          className={cn("input mt-2", state.error && "border-ember focus:border-ember")}
        />
      </label>
      <p id="email-error" role="alert" className="text-sm text-ember">
        {state.error}
      </p>
      {!state.error && (
        <p id="email-hint" className="text-sm text-muted">
          The code arrives in a minute or two. Check the spam folder if it does not.
        </p>
      )}
      <button name="intent" value="send" className="btn" disabled={pending} aria-busy={pending}>
        {pending ? "Sending…" : "Send code"}
      </button>
    </form>
  );
}
