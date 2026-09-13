import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getViewer } from "@/lib/auth";
import { safeNext } from "@/lib/utils";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Anand Rathi Tinkerers' Lab with your IIT Jodhpur email and a one-time code.",
  // Nothing here is useful in a search result, and the page bounces anyone
  // already signed in.
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const destination = safeNext(next);

  if (await getViewer()) redirect(destination);

  return (
    <div className="max-w-md">
      <PageHeader label="Account" title="Sign in">
        For IIT Jodhpur members. Enter your institute email and we&apos;ll send a one-time code.
        First time here? The same code creates your account.
      </PageHeader>
      {error && (
        <p className="mb-6 text-sm text-ember">That sign-in link has expired or was already used. Request a code instead.</p>
      )}
      <LoginForm next={destination} />
    </div>
  );
}
