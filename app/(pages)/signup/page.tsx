import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getViewer } from "@/lib/auth";
import { safeNext } from "@/lib/utils";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account at the Anand Rathi Tinkerers' Lab with your IIT Jodhpur email.",
  robots: { index: false, follow: true },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const destination = safeNext(next);

  if (await getViewer()) redirect(destination);

  const loginHref = destination === "/" ? "/login" : `/login?next=${encodeURIComponent(destination)}`;

  return (
    <div className="max-w-md">
      <PageHeader label="Account" title="Sign up">
        For IIT Jodhpur members. Use your institute email and choose a password.
      </PageHeader>
      <SignupForm next={destination} />
      <p className="mt-8 text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="link text-ink">
          Log in
        </Link>
      </p>
    </div>
  );
}
