"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";

export interface LoginState {
  email?: string;
  error?: string;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { email, error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.status === 429) {
      return { email, error: "Too many attempts. Wait a few minutes and try again." };
    }
    if (error.code === "email_not_confirmed") {
      return { email, error: "This account was never confirmed. Sign up again, or ask a lab administrator." };
    }
    // One message for a wrong password and an unknown email, so the form does
    // not reveal which addresses have accounts.
    return { email, error: "Email or password is incorrect." };
  }

  redirect(safeNext(formData.get("next")));
}
