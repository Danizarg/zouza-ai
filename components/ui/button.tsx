import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ink" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/* design.md v2: brand-500 primary, border-led secondary, rounded-lg.
   "ink" is the dark variant for use on paper when a brand-900 fill is wanted
   (e.g. inside chat chrome); it is never used on a brand-900 band. */
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
  ink: "bg-brand-900 text-paper hover:bg-brand-800 active:bg-brand-950",
  outline:
    "border border-border bg-surface text-ink hover:border-border-strong",
  ghost: "bg-transparent text-ink-2 hover:bg-paper-2 hover:text-ink",
};

/* md and lg keep a ≥44px box for touch (WCAG 2.5.8); sm is for dense,
   pointer-first UI only. */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "min-h-11 px-6 text-sm",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer whitespace-nowrap",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
