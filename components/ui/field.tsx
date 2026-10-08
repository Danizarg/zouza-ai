import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* Inputs use border-strong (3.17:1 on paper) so the control boundary itself
   clears WCAG 1.4.11; the global :focus-visible ring is NOT overridden here. */
const controlClasses =
  "w-full min-h-11 rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-2 transition-colors focus:border-brand-500 disabled:opacity-50";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-2">
      {children}
      {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlClasses, "min-h-28 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClasses, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

export function CheckboxRow({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors select-none",
        checked
          ? "border-brand-500 bg-brand-50 text-ink"
          : "border-border-strong bg-surface text-ink-2 hover:border-brand-400",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-brand-500)]"
      />
      {label}
    </label>
  );
}
