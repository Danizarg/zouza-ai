import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page max-w-2xl py-16 md:py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 text-3xl font-semibold text-navy-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-navy-500">Last updated {updated}</p>
      <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-navy-700">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-navy-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
