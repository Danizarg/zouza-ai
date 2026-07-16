import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-parchment px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-line bg-white p-8 shadow-card">
        <Link href="/" className="mb-6 inline-block font-display text-lg font-semibold text-navy-900">
          Zouza
        </Link>
        <h1 className="text-2xl font-semibold text-navy-950">{title}</h1>
        <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-navy-600">{footer}</p>
      </div>
    </div>
  );
}
