"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";

export interface LoginState {
  step: "email" | "code";
  email?: string;
  error?: string;
  notice?: string;
}

const INSTITUTE_DOMAIN = "@iitj.ac.in";

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

// One action for both steps, so the form keeps its state between them.
export async function signIn(prev: LoginState, formData: FormData): Promise<LoginState> {
  const intent = String(formData.get("intent") ?? "send");
  const supabase = await createClient();

  if (intent === "restart") return { step: "email" };

  if (intent === "send" || intent === "resend") {
    const email = readEmail(formData);
    if (!/^[^\s@]+@[^\s@]+$/.test(email) || !email.endsWith(INSTITUTE_DOMAIN)) {
      return { step: "email", email, error: `Use your IIT Jodhpur email (ending in ${INSTITUTE_DOMAIN}).` };
    }

    // The email carries both a code ({{ .Token }}, typed back in here, works on
    // any device) and a link (same browser only, lands on /auth/callback). The
    // code needs a custom email template, which Supabase only allows with custom
    // SMTP; until then the link is what arrives, so both paths stay wired.
    const origin = (await headers()).get("origin");
    const next = safeNext(formData.get("next"));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: origin ? `${origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined,
      },
    });
    if (error) {
      return {
        step: intent === "resend" ? "code" : "email",
        email,
        error:
          error.status === 429
            ? "Too many codes were requested recently. Wait a few minutes and try again."
            : error.message,
      };
    }
    return { step: "code", email, notice: intent === "resend" ? "A new code is on its way." : undefined };
  }

  // intent === "verify"
  const email = prev.email ?? readEmail(formData);
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) {
    return { step: "code", email, error: "Enter the code from the email." };
  }

  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    return { step: "code", email, error: "That code is wrong or has expired. Request a new one." };
  }

  redirect(safeNext(formData.get("next")));
}
