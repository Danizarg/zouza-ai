import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ink" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/* design.md: navy-led CTA voice, rounded-lg, border-led secondary. */
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-navy-950 text-ivory hover:bg-navy-800 active:bg-navy-900",
  ink: "bg-navy-900 text-ivory hover:bg-navy-800 active:bg-navy-950",
  outline:
    "border border-line bg-white text-navy-900 hover:border-navy-300",
  ghost: "bg-transparent text-navy-700 hover:bg-parchment hover:text-navy-950",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
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
