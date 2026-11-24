import { buttonClasses } from "@/components/ui/button";
import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border-strong bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">{body}</p>
      </div>
      {action ? (
        <Link href={action.href} className={buttonClasses("outline", "sm", "shrink-0")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
