"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/utils";

export interface SignupState {
  email?: string;
  error?: string;
}

const INSTITUTE_DOMAIN = "@iitj.ac.in";
const MIN_PASSWORD = 8;

export async function signUp(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!/^[^\s@]+@[^\s@]+$/.test(email) || !email.endsWith(INSTITUTE_DOMAIN)) {
    return { email, error: `Use your IIT Jodhpur email (ending in ${INSTITUTE_DOMAIN}).` };
  }
  if (password.length < MIN_PASSWORD) {
    return { email, error: `Use a password of at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirm) {
    return { email, error: "The two passwords do not match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { email, error: "An account with this email already exists. Log in instead." };
    }
    if (error.code === "weak_password") {
      return { email, error: error.message };
    }
    // Only reachable while "Confirm email" is on: the signup tried to send a
    // confirmation email and the built-in sender's cap was already spent.
    if (error.code === "over_email_send_rate_limit") {
      return {
        email,
        error:
          "The project is still set to send a confirmation email and has hit its email limit. A lab administrator needs to switch off Confirm email in Supabase.",
      };
    }
    if (error.status === 429) {
      return { email, error: "Too many attempts. Wait a few minutes and try again." };
    }
    return { email, error: error.message };
  }

  // With "Confirm email" switched off in Supabase, signUp returns a session and
  // the user is signed in already. Without a session, the project is still
  // waiting on an email confirmation that this form never asks for.
  if (!data.session) {
    return {
      email,
      error:
        "The account was created but could not be signed in, because this project still requires email confirmation. A lab administrator needs to switch that off.",
    };
  }

  // Somebody who clicked "Sign up" from the home page has no destination in
  // mind, so they get the welcome page. Somebody who was sent here from /admin
  // does, and gets bounced straight back to it.
  const destination = safeNext(formData.get("next"));
  redirect(destination === "/" ? "/thank-you" : destination);
}
