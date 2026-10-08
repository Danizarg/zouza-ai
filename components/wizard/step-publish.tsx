import { buttonClasses } from "@/components/ui/button";
import type { Listing } from "@/lib/types";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function StepPublish({ listing }: { listing: Listing }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700"
      >
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </motion.span>
      <h1 className="mt-6 text-2xl font-semibold text-ink sm:text-3xl">
        Your listing is live
      </h1>
      <p className="mt-2 max-w-md text-muted">
        “{listing.title}” is live. Suzi answers enquiries for you.
      </p>
      <p className="mt-2 text-sm text-muted">Free to create. €20/month once live.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/property/${listing.id}`} className={buttonClasses("primary", "lg")}>
          View listing
        </Link>
        <Link href="/dashboard/listings" className={buttonClasses("outline", "lg")}>
          Open my listings
        </Link>
      </div>
    </div>
  );
}
