import { ZMark } from "@/components/brand/z-mark";
import { buttonClasses } from "@/components/ui/button";
import Link from "next/link";

const NEXT = encodeURIComponent("/list-with-ai");

/** Shown instead of the wizard to a signed-out visitor in Supabase mode. */
export function SignInToList() {
  return (
    <div className="container-page flex max-w-xl flex-col items-center py-16 text-center md:py-24">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <ZMark className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold text-ink sm:text-3xl">
        Create a free account to list with Suzi
      </h1>
      <p className="mt-3 text-muted">
        Your listing belongs to you: enquiries, viewing requests and edits all come back to your
        account. Creating and previewing is free. The €20/month subscription starts only once a
        listing is live.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/auth/sign-up?next=${NEXT}`} className={buttonClasses("primary", "lg")}>
          Create account
        </Link>
        <Link href={`/auth/sign-in?next=${NEXT}`} className={buttonClasses("outline", "lg")}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
